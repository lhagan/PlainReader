#!/usr/bin/python

import os
import re
import fontforge

base_path = os.getcwd()
css_file = os.path.join(base_path, 'src/css/scss/primary.styles.scss')
font_file_source = os.path.join(base_path, 'src/fonts/iconic_stroke.otf')
font_file_target = os.path.join(base_path, 'publish/fonts/iconic_stroke.otf')
font_type = 'opentype'

print("getting glyph references from CSS file %s" % css_file)

# open CSS file and read contents
f = open(css_file, 'rb')
css_data = f.read()

# find all instances of a hex value appearing after content:
# TODO: improve logic to handle cases where content is used for another purpose
result = re.findall(".*content:\s*[\'\"]\\\([A-Za-z0-9]{4})[\'\"]", css_data)

# convert hex strings to int
icons = []
for item in result:
    icons.append(int(item, 16))
    
# eliminate duplicates
icons = dict.fromkeys(icons).keys()

print("found %s glyphs" % len(icons))
print(icons)

# open font file using fontforge library
font = fontforge.open(font_file_source)

print("removing unused glyphs from font")
# iterate through the glyphs in the font
it = iter(font.glyphs())
while True:
    try:
        value = it.next()
        n = value.glyphname
        u = value.unicode
        # remove glyph if not in the css file
        if u not in icons:
            font.removeGlyph(value)
    except StopIteration:
        break

# save target file & close original
print("saving file new file %s" % font_file_target)
font.generate(font_file_target, font_type)
font.close()
print("done")

