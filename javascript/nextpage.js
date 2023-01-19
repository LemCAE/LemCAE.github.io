var number = 0
var gd = 0
//  向下滚动还是向下滚动
var scrollFunc = function (e) {
    gd = e.wheelDelta;
}
if (document.addEventListener) {
    document.addEventListener('DOMMouseScroll', scrollFunc, false);
} //W3C  
window.onmousewheel = document.onmousewheel = scrollFunc; //IE/Opera/Chrome/Safari  
// scrop距离
var isScrolling = false //是否在滚动
listenAndScroll()

// 无限滚动
function listenAndScroll() {
    $(document).scroll(function () {//执行几千次
        var b = $(window).scrollTop();
        if (isScrolling) {
            return
        }//如果isScrolling为true就跳出去
        isScrolling = true//
        var scrollGap = 1000
        if (b > 0 && gd < 0) {
            let isBlock = b % scrollGap === 0 //%取余 余为零
            console.log(isBlock, b % scrollGap, b)
            if (isBlock) {
                return isScrolling = false//如果isBlock为true就跳出并isScrolling = false
                //跳出之后终止语句
            }
            let pos = (Math.floor(b / scrollGap) + 1) * scrollGap
            console.log(pos)
            $("html").animate({
                scrollTop: pos
            }, "slowly", function () {
                isScrolling = false;
            });

        }
        else if (b > 0 && gd > 0) {
            let isBlock2 = b % scrollGap === 0
            // console.log(b,isBlock2,scrollGap)
            if (isBlock2) return isScrolling = false
            let pos2 = (Math.ceil(b / scrollGap) - 1) * scrollGap
            console.log(pos2)
            $("html").animate({
                scrollTop: pos2
            }, "slowly", function () {
                isScrolling = false
            });
        }
        else {
            isScrolling = false
        }
    })
}
