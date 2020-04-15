'<div id="kk" class="as">foo</div>'
xml:load
'div' xml:$
'as' xml:has_class

'<div id="kk" class="as">foo</div>'
xml:load
'#kk' xml:$
xml:get_text

'<div id="kk" class="as">foo</div>'
xml:load
'div' xml:$
'class' xml:get_attr
