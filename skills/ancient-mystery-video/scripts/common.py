from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[2]


def run(*arguments: str) -> int:
    return subprocess.call(["uv", "run", "mystery", *arguments], cwd=ROOT)


if __name__ == "__main__":
    raise SystemExit(run(*sys.argv[1:]))
