#!/usr/bin/env python3
"""Generate the original, sample-free background track bundled with this Skill."""

from __future__ import annotations

from pathlib import Path
import argparse
import math
import subprocess
import tempfile
import wave

import numpy as np


SAMPLE_RATE = 48_000


def midi_frequency(note: int) -> float:
    return 440.0 * (2.0 ** ((note - 69) / 12.0))


def add_pluck(track: np.ndarray, start: float, duration: float, note: int, gain: float, pan: float) -> None:
    begin = int(start * SAMPLE_RATE)
    length = min(int(duration * SAMPLE_RATE), len(track) - begin)
    if length <= 0:
        return
    time = np.arange(length, dtype=np.float32) / SAMPLE_RATE
    frequency = midi_frequency(note)
    attack = np.minimum(1.0, time / 0.018)
    envelope = attack * np.exp(-2.25 * time)
    tone = np.zeros(length, dtype=np.float32)
    for harmonic, strength in ((1, 1.0), (2, 0.38), (3, 0.18), (5, 0.07)):
        tone += strength * np.sin(2 * math.pi * frequency * harmonic * time)
    tone *= envelope * gain / 1.63
    left = math.sqrt((1.0 - pan) / 2.0)
    right = math.sqrt((1.0 + pan) / 2.0)
    track[begin : begin + length, 0] += tone * left
    track[begin : begin + length, 1] += tone * right


def add_pad(track: np.ndarray, start: float, duration: float, notes: tuple[int, ...], gain: float) -> None:
    begin = int(start * SAMPLE_RATE)
    length = min(int(duration * SAMPLE_RATE), len(track) - begin)
    if length <= 0:
        return
    time = np.arange(length, dtype=np.float32) / SAMPLE_RATE
    attack = np.clip(time / 1.4, 0.0, 1.0)
    release = np.clip((duration - time) / 1.8, 0.0, 1.0)
    envelope = attack * release
    left = np.zeros(length, dtype=np.float32)
    right = np.zeros(length, dtype=np.float32)
    for index, note in enumerate(notes):
        frequency = midi_frequency(note)
        vibrato = 0.0018 * np.sin(2 * math.pi * (0.09 + index * 0.012) * time)
        phase = 2 * math.pi * frequency * time * (1.0 + vibrato)
        tone = np.sin(phase) + 0.16 * np.sin(phase * 2.0)
        if index % 2:
            left += tone * 0.72
            right += tone
        else:
            left += tone
            right += tone * 0.72
    scale = gain / max(1, len(notes))
    track[begin : begin + length, 0] += left * envelope * scale
    track[begin : begin + length, 1] += right * envelope * scale


def synthesize(duration: float) -> np.ndarray:
    track = np.zeros((math.ceil(duration * SAMPLE_RATE), 2), dtype=np.float32)
    beat = 60.0 / 68.0

    # D-major pentatonic. The repeating phrases are deliberately sparse so narration stays clear.
    phrase = (62, 64, 66, 69, 66, 64, 62, 57, 59, 62, 64, 62, 59, 57, 54, 57)
    bass = (50, 45, 47, 45)
    cursor = 0.65
    index = 0
    while cursor < duration - 0.5:
        note = phrase[index % len(phrase)]
        if index % 8 not in {6}:
            add_pluck(track, cursor, beat * 2.2, note, 0.16, -0.32 if index % 2 == 0 else 0.32)
        if index % 4 == 0:
            add_pluck(track, cursor, beat * 3.2, bass[(index // 4) % len(bass)], 0.11, 0.0)
        cursor += beat
        index += 1

    pad_chords = ((50, 57, 62), (47, 54, 59), (45, 52, 57), (47, 54, 62))
    chord_duration = beat * 8
    cursor = 0.0
    chord_index = 0
    while cursor < duration:
        add_pad(track, cursor, min(chord_duration + 1.6, duration - cursor), pad_chords[chord_index % 4], 0.045)
        cursor += chord_duration
        chord_index += 1

    # A few higher answering notes keep the loop alive without competing with speech.
    replies = ((7.7, 74), (15.4, 71), (23.1, 76), (31.0, 74), (39.0, 71), (47.0, 78), (55.0, 76))
    for start, note in replies:
        if start < duration:
            add_pluck(track, start, 3.0, note, 0.075, 0.18)

    peak = float(np.max(np.abs(track))) or 1.0
    return np.clip(track / peak * 0.72, -0.95, 0.95)


def write_wav(path: Path, track: np.ndarray) -> None:
    pcm = (track * 32767).astype("<i2").tobytes()
    with wave.open(str(path), "wb") as output:
        output.setnchannels(2)
        output.setsampwidth(2)
        output.setframerate(SAMPLE_RATE)
        output.writeframes(pcm)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("output", type=Path)
    parser.add_argument("--duration", type=float, default=72.0)
    arguments = parser.parse_args()
    arguments.output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as temporary:
        wav = Path(temporary) / "background.wav"
        write_wav(wav, synthesize(arguments.duration))
        subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-i",
                str(wav),
                "-af",
                "highpass=f=75,lowpass=f=6200,aecho=0.8:0.32:95|190:0.22|0.10,loudnorm=I=-24:TP=-3:LRA=7",
                "-ar",
                str(SAMPLE_RATE),
                "-ac",
                "2",
                "-codec:a",
                "libmp3lame",
                "-b:a",
                "192k",
                str(arguments.output),
            ],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.PIPE,
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
