$(function(){
	$("#inSearch").focus(function(){
		$(this).addClass("focus");
		if($(this).val() == this.defaultValue){
			$(this).val("");
		}
	}).blur(function() {
		$(this).removeClass("focus");
		if($(this).val() == ""){
			$(this).val(this.defaultValue);
		}
	}).keyup(function(e){
		if(e.which == 13){
			alert('回车提交表单');
		}
	})
})
//搜索框中文字效果

	$(function(){
    $(".nav").click(function(){
          $(this).next().slideToggle();
          $(this).parent().siblings().children(".jdNav").slideUp();
    });
});
//显示导航二级菜单

$(function(){
	$(".jnCatainfo.promoted").append('<s class="hot"></s>');
})

