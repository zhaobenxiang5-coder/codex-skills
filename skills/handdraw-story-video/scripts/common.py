#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
import os
import subprocess
import sys


def root() -> Path:
    configured = os.environ.get("HANDDRAW_STUDIO_ROOT")
    if configured:
        return Path(configured).expanduser().resolve()
    inferred = Path(__file__).resolve().parents[3]
    if (inferred / "pyproject.toml").exists():
        return inferred
    return Path("~/Documents/图文/handdraw-video-studio")


def run_handdraw(arguments: list[str]) -> int:
    studio = root()
    return subprocess.call(["uv", "run", "handdraw", *arguments], cwd=studio)


def main(prefix: list[str] | None = None) -> int:
    return run_handdraw([*(prefix or []), *sys.argv[1:]])
