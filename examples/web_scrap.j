'<div id="kk" class="as">foo</div>'
xml:loadDOM
'div' xml:$
'as' xml:has_class

'<div id="kk" class="as">foo</div>'
xml:loadDOM
'#kk' xml:$
xml:get_text

'<div id="kk" class="as">foo</div>'
xml:loadDOM
'div' xml:$
'class' xml:get_attr
