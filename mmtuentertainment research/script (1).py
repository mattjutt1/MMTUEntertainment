# Check what files are currently available in the environment
import os

print("📂 Current files in environment:")
print("=" * 40)

# List all files in current directory
current_files = []
for file in os.listdir('.'):
    if os.path.isfile(file):
        size = os.path.getsize(file) / 1024  # Size in KB
        current_files.append((file, size))

for filename, size in sorted(current_files):
    print(f"📄 {filename} ({size:.1f} KB)")

print(f"\n📁 Total files available: {len(current_files)}")

# Check if zip file exists
zip_exists = any('zip' in filename.lower() for filename, _ in current_files)
print(f"📦 Zip file present: {zip_exists}")

# Also check if the directory structure exists
if os.path.exists('MMTU_Strategic_Recovery_Package'):
    print(f"\n📂 Package directory exists")
    
    # Count files in package directory
    total_package_files = 0
    for root, dirs, files in os.walk('MMTU_Strategic_Recovery_Package'):
        total_package_files += len(files)
    print(f"📊 Total package files: {total_package_files}")
else:
    print(f"\n❌ Package directory not found")