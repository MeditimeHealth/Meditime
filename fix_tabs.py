import os

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the tab variables used. Usually "formLanguage" or "language"
    target_vars = ["formLanguage", "language"]
    
    # We want to replace {VAR === 'en' ? ( ... ) : ( ... )}
    # Since we can't easily parse JSX via regex, we'll do literal replacements where it's formatted in the standard way.

    lines = content.split('\n')
    out_lines = []
    
    changes = 0
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # Check if this line is the start of an English block
        is_en_start = False
        var_used = None
        for var in target_vars:
            if f"{{{var} === 'en' ? (" in line:
                # Need to verify it opens a Fragment <>
                if i + 1 < len(lines) and "<>" in lines[i+1]:
                    is_en_start = True
                    var_used = var
                    break

        if is_en_start:
            prefix = line[:line.find(f"{{{var_used} === 'en' ? (")]
            out_lines.append(prefix + f"<div className={{{var_used} === 'en' ? 'block' : 'hidden'}}>")
            i += 1
            if lines[i].strip() == "<>":
                # skip inner empty fragment open
                pass
            else:
                out_lines.append(lines[i].replace("<>", ""))
            changes += 1
        else:
            # Check if this line is closing English and opening Bangla
            if "</>" in line and i + 1 < len(lines) and ") : (" in lines[i+1] and i + 2 < len(lines) and "<>" in lines[i+2]:
                prefix = lines[i+1][:min(len(lines[i+1]) - len(lines[i+1].lstrip()), len(line) - len(line.lstrip()))]
                # Try to guess prefix from indentation
                indent = line[:len(line) - len(line.lstrip())]
                out_lines.append(indent + "</div>")
                
                # Figure out which var was used recently
                # Best effort: use generic regex or lookback
                # Since we track block, we can just replace
                var_guess = "formLanguage" if "formLanguage" in content else "language"
                out_lines.append(indent + f"<div className={{{var_guess} === 'bn' ? 'block' : 'hidden'}}>")
                # skip ) : (
                i += 2
                continue
            
            # Check if this line is closing Bangla 
            if "</>" in line and i + 1 < len(lines) and ")}" in lines[i+1]:
                indent = line[:len(line) - len(line.lstrip())]
                out_lines.append(indent + "</div>")
                i += 1
                continue
                
            out_lines.append(line)
        i += 1

    if changes > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write('\n'.join(out_lines))
        print(f"Fixed {changes} fields in {filepath}")

base_dir = r"c:\Users\hp\OneDrive\Desktop\meditime\app\admin"
for root, dirs, files in os.walk(base_dir):
    for file in files:
        if file.endswith('.tsx'):
            process_file(os.path.join(root, file))
