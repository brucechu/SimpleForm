(function($) {
    "use strict";

    /*
	*  A Simple Jquery Form Plugin
	*  SimpleForm use em tag to show the tips of an input element
	*  pattern="email" empty="please fill in email address" valid="true" unvalid="Unvalid Email Address" valid-css="good_input" unvalid-css="error_input"
	*  vali Parameter: when valid = true, the input box will be green，no tips； when valid="some text..."，the input box will be green，and tips will behind input box
	*
	*/
	$.fn.simpleForm = function() {
        
        return this.each(function() {
            var $this = $(this);

            if(!$this.data('simpleform')){
                $this.data('simpleform', new $.SimpleForm(
                    $this
                ));
			}

        });
    };


	$.SimpleForm = function($elem) {

        if (!$elem || !($elem instanceof $) || $elem.length !== 1) {
            throw new Error('Invalid parameter for SimpleForm.');
        }

        /**
         * @constant Link to this instance
         * @type object
         * @private
         */
        var self = this;

        /**
         * Init DOM elements repository
         */
        this.dom = {};

        /**
         * Store the input element we're attached to in the repository
         */
        this.dom.$elem = $elem;


        $elem.find('input').blur(function(){
		    var d = $(this);
			self.validateOnSubmit($elem,self);
	    });
        $elem.find('select').click(function(){
		    var d = $(this);
			self.validateOnSubmit($elem,self);
	    });
		$elem.find('textarea').blur(function(){
		    var d = $(this);
			self.validateOnSubmit($elem,self);
	    });


		$elem.submit(function(e){
			var onsubmit = $elem.attr('onsubmit');
			if(onsubmit){
				e.preventDefault();
			}

			var valid = self.validateOnSubmit($elem,self);
			var action = $elem.data('action');

			//check whether onvalid exists
			var onvalid = $elem.attr('onvalid');
			if(valid && onvalid){
                //IE fix: clear placeholer under IE9
				self.clear_ie_placeholder($elem);

				valid = eval("(" + onvalid + ")");
			}
			else if(valid && action){
				//submit form use ajax
				var data = $elem.serialize();
				$.post($elem.attr('action'),data,function(result){
					eval(action + "(\""+ result +"\")");
			    });
			    return false;
			}
			else{
                //clear placeholder under IE9
				self.clear_ie_placeholder($elem);
			}
			
		    return valid;
		});

	};

    //clear placeholder under IE9
	$.SimpleForm.prototype.clear_ie_placeholder = function(d) {
		if(jQuery.browser.msie && jQuery.browser.version < 10){
			for(var i = 0; i < d[0].elements.length; i++)
			{
				var e = d[0].elements[i];
				var dd = $(e);
				var placeholder = dd.attr('placeholder');
				if(e.value == placeholder){
					dd.val('');
				}
			}
		}
	};


    $.SimpleForm.prototype.validate = function(d) {

		var passed = true;

		//check whether an em exists or not
		var em = d.nextAll('em');
		if(em.length==0){
			em = d.parent().nextAll('em');
			if(em.length==0){
				em = $('<em></em>');
				d.after(em);
			}
		}

		var empty = d.attr('empty');
		var valid = d.attr('valid');
		var unvalid = d.attr('unvalid');
		var pattern = d.attr('regex');
		if(!pattern) pattern = '';

		var valid_css = d.attr('valid-css');
		var unvalid_css = d.attr('unvalid-css');

		var placeholder = d.attr('placeholder');


		//handle input[radio checkbox]
		var fieldType = d.prop("type");

		var value = d.val();
		if(value == '' || value == placeholder || fieldType == 'radio' || fieldType == 'checkbox' ){
			//empty
			var all_empty = true;

			//handle empty-group
			var empty_group = d.attr('empty-group');
			if(empty_group){
				//comma ，to split the group
				var arr=empty_group.split(",");
				if(arr){
					//check whether all the input element in empty-group is empty or not
					var atv;
					for(var i=0; i< arr.length; i++){
						if(arr[i] != ''){
							atv = $(arr[i]).val();
							if(atv != '' && atv != $(arr[i]).attr('placeholder')){
							    all_empty = false;
							}
						}
					}
				}
			}

			//handle input[radio checkbox]
			if(fieldType == 'radio' || fieldType == 'checkbox'){
				var fieldName = d.prop("name");
				var fields = $("input[name='"+ fieldName +"']");
				for(var i=0; i< fields.length; i++){
					if($(fields[i]).attr('checked')){
						all_empty = false;
					}
				}
			}

		   	if(all_empty && empty){
				em.css({'display':'inline-block'}).html(empty);

				if(valid_css)d.removeClass(valid_css);
				if(unvalid_css)d.addClass(unvalid_css);
				passed = false;
			}
			else{
				if(valid){
					em.css({'display':'inline-block'}).html('');
					if(!(valid === true)){
					    em.html(valid);
					}
				}
				else{
					em.hide();
				}
				if(unvalid_css)d.removeClass(unvalid_css);
				if(valid_css)d.addClass(valid_css);
			}
		}
		else{

			if(pattern.toLowerCase().indexOf('equalto:') == 0){
				//check input value with another input element
				var equal_d = pattern.replace('equalto:','');
				if($(equal_d).val() != d.val()){
					passed = false;
				}
			}
			else if(pattern.toLowerCase().indexOf('func:') == 0){
				//check input value with an function
				var func_d = pattern.replace('func:','');
				var func_ret = eval(func_d + "()");
				if(!func_ret){
					passed = false;
				}
			}
			else if(pattern.toLowerCase().indexOf('ajax:') == 0){
				//check input value with an ajax url
				var ajax_url = pattern.replace('ajax:','');

				if(ajax_url){
					$.ajax({
						async: false,
						type : "POST",
						url : ajax_url,
						dataType : 'text',
						data : "value=" + d.val(), 
						success : function(data) {
							passed=data;
						}
					});
				}
			}
			else{

				switch(pattern)
				{
					case 'email': pattern = /^\w+([-+.]\w+)*@\w+([-.]\w+)+$/i;break;
					case 'ip': pattern = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/i;break;
					case 'url': pattern = /^[a-zA-Z]+:\/\/(\w+(-\w+)*)(\.(\w+(-\w+)*))+(\/?\S*)?$/i;break;
					case 'date': pattern = /^(?:(?!0000)[0-9]{4}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)-02-29)$/i;break;
					case 'datetime': pattern = /^(?:(?!0000)[0-9]{4}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)-02-29) (?:(?:[0-1][0-9])|(?:2[0-3])):(?:[0-5][0-9]):(?:[0-5][0-9])$/i;break;
					case 'int':	pattern = /^\d+$/i;break;
					case 'float': pattern = /^\d+\.?\d*$/i;break;
					case 'password' : pattern = /^[\@A-Za-z0-9\!\#\$\%\^\&\*\.\~]{6,22}$/;break;
				}

                //check the rule
				if(pattern){
					if(!pattern.test){
						pattern = new RegExp(pattern,'g');
					}
				    passed = pattern.test(value);
				}
			}

			if (!passed){
				em.css({'display':'inline-block'}).html(unvalid);

				if(valid_css)d.removeClass(valid_css);
				if(unvalid_css)d.addClass(unvalid_css);
			}
			else{
				if(valid){
					em.css({'display':'inline-block'}).html('');
					if(!(valid === true)){
					    em.html(valid);
					}
				}
				else{
					em.hide();
				}

				if(unvalid_css)d.removeClass(unvalid_css);
				if(valid_css)d.addClass(valid_css);
			}
		}
		return passed;
    };


    $.SimpleForm.prototype.validateOnSubmit = function(d,self) {
        var valid = true;
        for(var i = 0; i < d[0].elements.length; i++)
        {
            var e = d[0].elements[i];
			var dd = $(e);
			var forcevalidate = dd.attr('forcevalidate');
			if(forcevalidate)forcevalidate = eval("("+ forcevalidate +")");
            if (forcevalidate || (e.type == "text" || e.type == "password" || e.type == "select-one" || e.type == "textarea" || e.type == "radio" || e.type == "checkbox") && e.style.display!='none') {
				if(dd.is(":visible") && !dd.attr('disabled') || forcevalidate ){
		            if(!self.validate(dd)){
					    valid = false;
				    }
				}
			}
		}

		return valid;
    };

})(jQuery);

