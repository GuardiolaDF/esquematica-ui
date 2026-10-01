import json

def rgb_to_hex(r, g, b):
    return "#{:02x}{:02x}{:02x}".format(int(r*255), int(g*255), int(b*255))

def process_node(node, depth=0):
    indent = "  " * depth
    name = node.get('name', 'Unnamed')
    node_type = node.get('type', 'UNKNOWN')
    
    props = []
    
    # Layout and size
    box = node.get('absoluteBoundingBox')
    if box:
        props.append(f"W:{box.get('width',0):.1f} H:{box.get('height',0):.1f}")
        
    # Layout properties (auto layout)
    if node.get('layoutMode'):
        mode = node.get('layoutMode')
        padding = f"P:{node.get('paddingTop',0)},{node.get('paddingRight',0)},{node.get('paddingBottom',0)},{node.get('paddingLeft',0)}"
        gap = f"Gap:{node.get('itemSpacing', 0)}"
        props.append(f"Flex({mode}) {padding} {gap}")

    # Colors
    fills = node.get('fills', [])
    if fills:
        colors = []
        for f in fills:
            if f.get('type') == 'SOLID' and 'color' in f:
                c = f['color']
                colors.append(rgb_to_hex(c['r'], c['g'], c['b']))
        if colors:
            props.append(f"bg: {','.join(colors)}")

    strokes = node.get('strokes', [])
    if strokes:
        colors = []
        for s in strokes:
            if s.get('type') == 'SOLID' and 'color' in s:
                c = s['color']
                colors.append(rgb_to_hex(c['r'], c['g'], c['b']))
        if colors:
            props.append(f"border: {node.get('strokeWeight',1)}px {','.join(colors)}")

    # Text properties
    if node_type == 'TEXT':
        style = node.get('style', {})
        font = style.get('fontFamily', '')
        size = style.get('fontSize', '')
        weight = style.get('fontWeight', '')
        props.append(f"Text({font} {size}px w{weight})")
        chars = node.get('characters', '')
        props.append(f"Content: {chars[:30].replace(chr(10), ' ')}")
        
    props_str = " | ".join(props) if props else ""
    
    lines = [f"{indent}- [{node_type}] {name} {props_str}"]
    
    for child in node.get('children', []):
        lines.extend(process_node(child, depth + 1))
        
    return lines

try:
    with open('figma_node.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    main_node = list(data['nodes'].values())[0]['document']
    
    tree_lines = process_node(main_node)
    
    with open('figma_summary.txt', 'w', encoding='utf-8') as out:
        out.write('\n'.join(tree_lines))
        
    print("Successfully generated figma_summary.txt")
except Exception as e:
    print(f"Error: {e}")
