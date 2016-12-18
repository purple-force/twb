//todo:
//1、表单项视图到值的绑定
var Twb=function(opt){
	this.opt=opt;
	this.bindedTarget=this._getBindedTarget();
	this.data=opt.data;
	this.cache={};
	this.keyTextMap=[];//存放每个绑定数据的DOM对象的数据变量及其innerHTML
	this.init();
};
Twb.prototype={
	init:function(){
		var _this=this;
		var data=this.data;
		this.keyTextMap=this._getKeyTextMap();
		//将所有数据放入实例缓存中，供后续更新视图时使用
		//与下一个遍历分开的原因是在赋值(set)时会触发视图更新，但有些数据还获取不到
		for(var key in data){
			if(data.hasOwnProperty(key)){
				this["cache"][key]=data[key];
			}
		}
		for(var key in data){
			if(data.hasOwnProperty(key)){
				(function(key){
					Object.defineProperty(_this,key,{
						get:function(){
							return this["cache"][key];
						},
						set:function(val){
							if(val!==this["cache"][key]){
								this["cache"][key]=val;
								this.updateView();
							}
						},
						enumerable:true,
						configurable:true
					});
				})(key);//原因：将key进行作用域绑定，从而使defineProperty的key和get、set中的key始终保持一致
			}
		}
		//触发视图更新
		this.updateView();
	},
	/**
	 * [更新视图]
	 */
	updateView:function(){
		var _this=this,
			keyTextMap=this.keyTextMap,
			target=this.bindedTarget;
		var eval_reg=new RegExp("\\{\\{.+?\\}\\}","g"),//获取所有绑定数据匹配项，用作计算求值
			replace_reg=new RegExp("\\{\\{.+?\\}\\}");//获取所有绑定数据匹配项，用作替换
		for(var i=0,len1=keyTextMap.length;i<len1;i++){
			var key=keyTextMap[i].key,
				text=keyTextMap[i].text;
			for(var j=0,len2=key.length;j<len2;j++){
				//js不支持正则后行断言，比较麻烦
				/*var reg=new RegExp("(?:\\{\\{[^(\\{\\{)]*)"+key[j]+"(?:[^(\\}\\})]*\\}\\})","g");
				text=text.replace(reg,"{{this.cache."+key[j]+"}}");*/
				var reg=new RegExp("\\s*\\b"+key[j]+"\\b\\s*(?![\'\"])","g");
				text=text.replace(reg," _this.cache."+key[j]);
			}
			var arr=text.match(eval_reg);
			if(arr&&arr.length){
				for(var k=0,len3=arr.length;k<len3;k++){
					/*reg=new RegExp("\\{\\{.*_this\.cache\."+key[k]+".*\\}\\}","g");*/
					text=text.replace(replace_reg,eval(arr[k]));
				}
			}
			target[i].innerHTML=text;
		}
	},
	/**
	 * [获取构造函数参数target指定且带有bind-model属性的DOM节点]
	 * @return {NodeList} [description]
	 */
	_getBindedTarget:function(){
		var target=document.querySelectorAll(this.opt.target),
			arr=[];
		for(var i=0,len=target.length;i<len;i++){
			if(target[i].hasAttribute("bind-model")){
				arr.push(target[i]);
			}
		}
		return arr;
	},
	/**
	 * [获取绑定数据和DOM结构的map]
	 * @return {[arr]} [description]
	 * 返回值结构：
	 * [{
	 * 		key:[key1,key2,...],//bind-model指定的key组成的数组
	 * 		text:xxxxx//该指定DOM的innerHTML文本
	 * },....]
	 */
	_getKeyTextMap:function(){
		var target=this.bindedTarget;
		var re=[];
		for(var i=0,len=target.length;i<len;i++){
			var obj={};
			obj.key=target[i].getAttribute("bind-model").split(",");
			obj.text=target[i].innerHTML;
			re.push(obj);
		}
		return re;
	}
};