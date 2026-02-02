import os
import re
import sys

def resolve_conflicts(root_dir):
    print(f"🔧 Resolving conflicts in {root_dir}")
    
    # Files often containing custom features to protect
    custom_protect_patterns = [
        r"packages/core/src/core/turn\.ts",
        r"packages/core/src/services/loadBalancerService\.ts",
        r"packages/cli/src/ui/commands/.*",
        r"ZAPABOB_PATCHES\.md",
        r"README\.md" # We will manual merge README later
    ]
    
    conflict_files = []
    # Identify files with conflict markers
    for root, dirs, files in os.walk(root_dir):
        if any(ignored in root for ignored in ['node_modules', '.git', 'dist', 'bundle']):
            continue
        for file in files:
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    if '<<<<<<< HEAD' in content:
                        conflict_files.append(path)
            except:
                pass

    print(f"Found {len(conflict_files)} files with conflicts.")

    for path in conflict_files:
        rel_path = os.path.relpath(path, root_dir).replace('\\', '/')
        should_protect = any(re.search(pattern, rel_path) for pattern in custom_protect_patterns)
        
        try:
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()

            # Simple resolution logic:
            # If protected, keep HEAD. If not, keep upstream (incoming).
            # Marker format: <<<<<<< HEAD ... ======= ... >>>>>>> UPSTREAM_REF
            
            def replace_conflict(match):
                head = match.group(1)
                upstream = match.group(2)
                if should_protect:
                    print(f"Protecting {rel_path} (HEAD preserved)")
                    return head
                else:
                    return upstream

            # Regex for conflict markers
            pattern = re.compile(r"<<<<<<< HEAD\n([\s\S]*?)\n=======\n([\s\S]*?)\n>>>>>>> [^\n]*\n", re.MULTILINE)
            
            new_content = pattern.sub(replace_conflict, content)
            
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new_content)
        except Exception as e:
            print(f"Error resolving {path}: {e}")

if __name__ == "__main__":
    resolve_conflicts(os.getcwd())
