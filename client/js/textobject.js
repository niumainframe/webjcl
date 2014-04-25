//Manages all of the text objects for a particular pane. Assigned to a pane at the start.
var TextObjectManager = function(id, panel){
	this.__TextObjectIndex = 0; //Index to slowly increment id of TO so that we always have diff names.
	this.__TextObjectArray = {}; //Object that holds reference to TO.
	this.__panel = panel; //Panel the object is assigned to.
	this.__id = id; //ID of this manager. All TO made by it have it included in their ID.
	this.__activeTab = false; //The tab we currently have active or false if none.
	var reference = this; //Need this for jquery functions.
	
	//Handle clicking on tabs.
	$(panel).find('ul.tabs').on('click','li',function(){
		var elem = $(this);
		if(elem.hasClass('selected') == false){
			var index = elem.attr('data-index');
			if(reference.__activeTab){
				reference.__activeTab.hide();
			}
			reference.__activeTab = reference.__TextObjectArray[index].show();
		}
	});	
	
	//Handle clicking the close button
	$(panel).find('ul.tabs').on('click','i.closeTab',function(e){
		e.stopPropagation();
		var index = $(this).parent().attr('data-index');
		var to = reference.__TextObjectArray[index];
		if(to == reference.__activeTab){
			reference.__activeTab = false;
		}
		to.destroy();
		delete reference.__TextObjectArray[index];
	});
}

//Creates a text object based on the parameters.
TextObjectManager.prototype.createTextObject = function(name){
	if(this.__activeTab){
		this.__activeTab.hide();
	}
    
	// Add a new tab associated with a TextObject
	var textObject = new TextObject(this.__id + this.__TextObjectIndex, name, this.__panel, this.__TextObjectIndex);
	this.__TextObjectArray[this.__TextObjectIndex] = textObject;
	this.__activeTab = this.__TextObjectArray[this.__TextObjectIndex];
	this.__TextObjectIndex++;
	
	
	// Register listener when the selection changes
	var aceEditor = textObject.editor;
	
	aceEditor.on("changeSelection", function () {
		
		// Obtain column position (w offset)
		var column = aceEditor.getCursorPosition().column + 1;
	    
	    // Update column div
		$('#colCounter').html('Column: ' + column)
	});
	
	
	return this.__TextObjectIndex;
}

//Returns the TO via the index number in the array object.
TextObjectManager.prototype.getByIndex = function(index){
	return this.__TextObjectArray[index-1];
}

//Returns the active TO.
TextObjectManager.prototype.getActive = function(){
	return this.__activeTab;
}




//Text objects are an object that handles the creation and managemenet of a tab and an ace editor instance.
var TextObject = function(id, name, panel, index){
	this.tab = $('<li id="TextObjectTab-' + id + '" class="selected" data-index="' + index + '"><a>' + name + '</a> <i class="closeTab icon-remove"></i></li> ').appendTo($(panel).find('ul.tabs'));
	this.textArea = $('<li id="TextObject-' + id + '"></li>').appendTo($(panel).find('ul.textSpace'));
	this.editor = ace.edit('TextObject-' + id);
	this.editor.setTheme('ace/theme/webjcl');
}

//Adds selected to the text object's tab, shows the editor, and resizes ace.
TextObject.prototype.show = function(){
	this.tab.addClass('selected');
	this.textArea.show();
	this.editor.resize();
	return this;
}

//Removes the selected tag from the tab and hides the text editor.
TextObject.prototype.hide = function(){
	this.tab.removeClass('selected');
	this.textArea.hide();
	return this;
}

//Destroys the tab, editor area, and eliminates the instance of ace.
TextObject.prototype.destroy = function(){
	this.tab.remove();
	this.editor.destroy();
	this.textArea.remove();
}
