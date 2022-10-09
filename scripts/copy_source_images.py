import shutil
import sys
import os
import re


def copy_source_images(path, path_copied):
    """
    Copy all images in folders/subfolders whose name not end with "???x???" to a new folder
    """
    for root, _, files in os.walk(path):
        for name in files:
            if not re.match('.*-[0-9]{1,4}x[0-9]{1,4}.*', name):
                file_full_path = os.path.abspath(os.path.join(root, name))
                rst = shutil.copy(file_full_path, path_copied)
                if (rst):
                    print(f'✅ Copied "{name}" to {path_copied}')


if __name__ == "__main__":
    copy_source_images(sys.argv[1], sys.argv[2])
