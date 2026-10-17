"""
Convenience entrypoint for seeding database from backend directory:
Usage: python scripts/seed.py
"""
import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

# Add data/seeds to path
root_dir = backend_dir.parent
sys.path.insert(0, str(root_dir))

from data.seeds.seed_db import seed

if __name__ == "__main__":
    seed()
