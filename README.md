SimpleForm
==========

A Simple Jquery Form Plugin, A Really Simple One.
------------
*  SimpleForm use em tag to show the tips of an input element
*  pattern="email" empty="please fill in email address" valid="true" unvalid="Unvalid Email Address" valid-css="good_input" unvalid-css="error_input"
*  vali Parameter: when valid = true, the input box will be green£¬no tips£» when valid="some text..."£¬the input box will be green£¬and tips will behind input box

Parameter for Form:
------------
- 1.`<form method="post" action="test.php" class="simpleform" onvalid="submitForm()">`
When click submit, and all the input element is fine, form will eval the function in onvalid parameter

- 2.`<form method="post" action="test.php" class="simpleform" data-action="submitForm">`
When click submit, and all the input element is fine, form will post the data to test.php and pass the data from server to the function in data-action parameter


Parameter for Input Element:
<input type="text" regex="email" valid-css="good_input" unvalid-css="error_input" empty="please fill in email address" unvalid="Unvalid Email Address" forcevalidate empty-group="#a-input,#b-input">
- 1.   `regex   `                          the regular expression for input element, make an expression yourself, or use email,ip,url,date,datetime,int,float,password 
- 2.   `valid-css  `                       the css apply to input element when all is fine
- 3.   `unvalid-css `                      the css apply to input element when something is wrong
- 4.   `empty    `                         when the input element is empty, show the text in empty parameter
- 5.   `unvalid`                           when the value is not fit with regex, show the text in unvalid parameter
- 6.   `valid  `                           default value  valid=true. when the value is fit with regex and the valid has some text for tips, show the text in valid parameter
- 7.   `forcevalidate `                    On default, SimpleForm will not check the hidden input element, add a forcevalidate to an input element will check the hidden input element.
- 8.   `empty-group`                       In some case, we have A input box and B input box, while A or B has a something, that's ok.But it can't be both is empty.we can use empty-group="#a-input,#b-input"
- 9.   `regex="equalto:#a-input"`          the input value must equal to a-input,just like an confirm password.
- 10.  `regex="func:checkemail"`           the input value must equal to function's return value
- 11.  `regex="ajax:/valid-username.php"`  Post the input value to server, check the value whether ok
