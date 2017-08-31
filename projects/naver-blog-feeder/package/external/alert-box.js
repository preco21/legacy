(function() {
	
var gui = require("nw.gui");
	
var alertBox = {
	width: 390,
	height: 105,
	_index: 0,
	_stack: [],
	showAlert: function(title, content, link, aliveTime)
	{
		aliveTime = aliveTime || 5400;
		
		var index = this._index;
		var that = this;
		
		if (!(title && content))
			return;
		
		var guiWindow = gui.Window.open("app://preco/package/partials/alert-box/index.html", {
			show: true,
			toolbar: false,
			frame: false,
			resizable: false,
			transparent: true,
			"always-on-top": true,
			show_in_taskbar: false,
			width: this.width,
			height: this.height
		});
		
		guiWindow.on("loaded", function()
		{			
			this.window.alertTitle = title;
			this.window.alertContent = content;
			this.window.alertLink = link;
			this.window.index = index;
			this.window.aliveTime = aliveTime;
			
			var formX = this.width - that.width;
			var formY = this.height - that.height;
			var x = screen.availWidth - this.width - formX;
			var y = screen.availHeight - (that._stack.length * (this.height + formX));
			
			this.moveTo(x, y);
		});
		
		this._index++;
		this._stack.push(guiWindow);
	},
	closeAlert: function(index)
	{
		var stack = this._stack;
		
		stack[index].close();
		stack.splice(index, 1);
		
		this._index--;
		this.updateIndex();
		this.positionAlert();
	},
	closeAllAlert: function()
	{
		var stack = this._stack;
		
		for (var i = 0; i < stack.length; i++)
			stack[i].close();
		
		stack.length = 0;
	},
	positionAlert: function()
	{
		var stack = this._stack;
		
		for (var i = 0; i < stack.length; i++)
			stack[i].y = screen.availHeight - (i * this.height + this.height);
	},
	updateIndex: function()
	{
		var stack = this._stack;
		
		for (var i = 0; i < stack.length; i++)
			stack[i].window.index = i;
	}
};
	
window.alertBox = alertBox;
	
})();