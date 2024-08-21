import os

# Define the output file location
output_dir = 'scripts/output'
output_file = os.path.join(output_dir, 'snapshot.txt')

# Create the output directory if it doesn't exist
os.makedirs(output_dir, exist_ok=True)

# Clear the output file if it already exists
with open(output_file, 'w') as f:
    pass

# Define folders to exclude
exclude_folders = ['node_modules', 'scripts/output', '.git', 'dist', 'build']

# Recursively go through all user-created folders and files
for root, dirs, files in os.walk('.'):
    # Exclude specific folders
    dirs[:] = [d for d in dirs if d not in exclude_folders and not d.startswith('.')]

    for file in files:
        file_path = os.path.join(root, file)
        # Skip hidden files and non-text files
        if file.startswith('.') or not file_path.split('.')[-1] in ['js', 'html', 'css', 'md', 'txt', 'json']:
            continue
        
        # Write the relative path and file contents to the output file
        with open(output_file, 'a') as out_file:
            out_file.write(f'---\nRelative Path: {file_path}\n---\n')
            try:
                with open(file_path, 'r') as current_file:
                    out_file.write(current_file.read() + '\n\n')
            except UnicodeDecodeError:
                out_file.write(f"Unable to read file: {file_path} (possibly binary)\n\n")

print(f'Snapshot saved to {output_file}')