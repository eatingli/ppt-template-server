function TextareaPlus(textareaId) {
  var textarea = this.textarea = $(textareaId);

  //綁定輸入事件
  textarea.bind('input propertychange', function(e) {
    textarea.trigger('textareaChange', [e]);
  });
}

TextareaPlus.prototype.getText = function() {
return this.textarea.val();
}

TextareaPlus.prototype.setText = function(text) {
this.textarea.val(text);
this.textarea.trigger('textareaChange');
}

TextareaPlus.prototype.focus = function() {
this.textarea.focus();
};

TextareaPlus.prototype.getCursorPos = function() {
return this.textarea.prop("selectionStart");
};

TextareaPlus.prototype.setCursorPos = function(index) {
this.textarea.prop("selectionStart", index);
this.textarea.prop("selectionEnd", index);
};

TextareaPlus.prototype.insertTextAtCursor = function(text) {
var pos = this.getCursorPos();
var str = this.getText();
var prefix = str.substring(0, pos);
var suffix = str.substring(pos);
this.setText(prefix + text + suffix);
this.setCursorPos(pos + text.length);
};

TextareaPlus.prototype.insertTextAtLineHead = function(text) {
var pos = this.getCursorPos();
var str = this.getText();
pos = str.substring(0, pos).lastIndexOf('\n') + 1 || 0;

var prefix = str.substring(0, pos);
var suffix = str.substring(pos);
this.setText(prefix + text + suffix);
this.setCursorPos(pos + text.length);
};

TextareaPlus.prototype.onChange = function(callback) {
this.textarea.bind('textareaChange', callback);
}