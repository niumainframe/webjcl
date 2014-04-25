define('ace/theme/webjcl', ['require', 'exports', 'module' , 'ace/lib/dom'], function(require, exports, module) {

exports.isDark = false;
exports.cssClass = "ace-webjcl";
exports.cssText = ".ace-webjcl .ace_gutter {\
background: #eaeaea;\
border-left:1px #f0f0f0 solid;\
background-image: -moz-linear-gradient(left, #dddddd 0%, #eaeaea 100%);\
color: #909090;\
}\
.ace-webjcl .ace_print-margin {\
width: 0px;\
border-left: #a0a0a0 dotted 1px;\
}\
.ace-webjcl .ace_scroller {\
background-color: #fafafa;\
}\
.ace-webjcl .ace_constant.ace_other,\
.ace-webjcl .ace_text-layer {\
color: #101010\
}\
.ace-webjcl .ace_cursor {\
border-left: 2px solid #505050\
}\
.ace-webjcl .ace_overwrite-cursors .ace_cursor {\
border-left: 0px;\
border-bottom: 1px solid #FFFFFF\
}\
.ace-webjcl .ace_marker-layer .ace_selection {\
background: #a6a2a1\
}\
.ace-webjcl.ace_multiselect .ace_selection.ace_start {\
box-shadow: 0 0 3px 0px #002451;\
border-radius: 2px\
}\
.ace-webjcl .ace_marker-layer .ace_step {\
background: rgb(127, 111, 19)\
}\
.ace-webjcl .ace_marker-layer .ace_bracket {\
margin: -1px 0 0 -1px;\
border: 1px solid #404F7D\
}\
.ace-webjcl .ace_marker-layer .ace_active-line {\
background: #d3eEb0\
}\
.ace-webjcl .ace_gutter-active-line {\
background-color: #c3dEa0\
}\
.ace-webjcl .ace_marker-layer .ace_selected-word {\
border: 1px solid #a6a2a1\
}\
.ace-webjcl .ace_invisible {\
color: #404F7D\
}\
.ace-webjcl .ace_keyword,\
.ace-webjcl .ace_meta,\
.ace-webjcl .ace_storage,\
.ace-webjcl .ace_storage.ace_type,\
.ace-webjcl .ace_support.ace_type {\
color: #69b2b7\
}\
.ace-webjcl .ace_keyword.ace_operator {\
color: #a1a1a1\
}\
.ace-webjcl .ace_constant.ace_character,\
.ace-webjcl .ace_constant.ace_language,\
.ace-webjcl .ace_constant.ace_numeric,\
.ace-webjcl .ace_keyword.ace_other.ace_unit,\
.ace-webjcl .ace_support.ace_constant,\
.ace-webjcl .ace_variable.ace_parameter {\
color: #FFC58F\
}\
.ace-webjcl .ace_invalid {\
color: #FFFFFF;\
background-color: #F99DA5\
}\
.ace-webjcl .ace_invalid.ace_deprecated {\
color: #FFFFFF;\
background-color: #EBBBFF\
}\
.ace-webjcl .ace_fold {\
background-color: #BBDAFF;\
border-color: #FFFFFF\
}\
.ace-webjcl .ace_entity.ace_name.ace_function,\
.ace-webjcl .ace_support.ace_function,\
.ace-webjcl .ace_variable {\
color: #DE5757\
}\
.ace-webjcl .ace_support.ace_class,\
.ace-webjcl .ace_support.ace_type {\
color: #FFEEAD\
}\
.ace-webjcl .ace_markup.ace_heading,\
.ace-webjcl .ace_string {\
color: #D1F1A9\
}\
.ace-webjcl .ace_entity.ace_name.ace_tag,\
.ace-webjcl .ace_entity.ace_other.ace_attribute-name,\
.ace-webjcl .ace_meta.ace_tag,\
.ace-webjcl .ace_string.ace_regexp,\
.ace-webjcl .ace_variable {\
color: #E8BB51\
}\
.ace-webjcl .ace_comment {\
color: #7285B7\
}\
.ace-webjcl .ace_markup.ace_underline {\
text-decoration: underline\
}\
.ace-webjcl .ace_indent-guide {\
background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAEklEQVQImWNgUAn8z7Bq1ar/ABBUBHJ4/r3JAAAAAElFTkSuQmCC) right repeat-y\
}";

var dom = require("../lib/dom");
dom.importCssString(exports.cssText, exports.cssClass);
});
