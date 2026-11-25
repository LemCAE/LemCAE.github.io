这里主要记录一些 HTML 中的方法和分析！

## CSS Style 类型

### 背景图片的设置

一般来说，网页背景图片是设置成居中、铺满且不重复的。要达到这一点，可以在 CSS 里面设置：

```css
body {
  background-image: url();
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
```

其中，`background-image: url()` 指定了背景图片的位置，`background-size: cover` 使得背景图片**在保留宽高比**的情况下**缩放至铺满页面**，`background-position: center` 和 `background-repeat: no-repeat` 则分别使背景居中和不重复。

### 多个元素的排序

在排列一些内容或链接时，经常希望它们可以按行列规律排序，这里主要使用 `display: flex` 属性达到这一效果：

```css
.container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-around;
}
```

从上到下作用依次为：

- 使用 `flex` 布局方式（[补充资料](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_flexible_box_layout/Basic_concepts_of_flexbox)）
- 实现多行 flex 容器
- 使元素以中心对齐
- 自动分配子元素的空间使其在一行上均匀分布

## JS Script 类型

### 对键盘 / 鼠标输入的检测

JavaScript 中可以使用 `addEventListener()` 函数添加对键盘输入的监听。例如：

```javascript
document.addEventListener('keydown', function(event) {
  if (event.keyCode === 109 || event.keyCode === 77) {
    changeMenuShow();
  }
});
```

其中，`keyCode === 77` 对应 `m` 和 `M` 的输入，`changeMenuShow()` 即为按键按下后要执行的函数。

<details>
<summary>keyCode 对应表</summary>

| keyCode | 对应按键 |
| --- | --- |
| 8 | BackSpace |
| 9 | Tab |
| 12 | Clear |
| 13 | Enter |
| 16 | Shift_L |
| 17 | Control_L |
| 18 | Alt_L |
| 19 | Pause |
| 20 | Caps_Lock |
| 27 | Esc Escape |
| 32 | Space |
| 33 | Page Up |
| 34 | Page Down |
| 35 | End |
| 36 | Home |
| 37 | Left Arrow |
| 38 | Up Arrow |
| 39 | Right Arrow |
| 40 | Down Arrow |
| 41 | Select |
| 42 | Print |
| 43 | Execute |
| 45 | Insert |
| 46 | Delete |
| 47 | Help |
| 48 | 0 ) |
| 49 | 1 ! |
| 50 | 2 @ |
| 51 | 3 # |
| 52 | 4 $ |
| 53 | 5 % |
| 54 | 6 ^ |
| 55 | 7 & |
| 56 | 8 * |
| 57 | 9 ( |
| 65 | a A |
| 66 | b B |
| 67 | c C |
| 68 | d D |
| 69 | e E |
| 70 | f F |
| 71 | g G |
| 72 | h H |
| 73 | i I |
| 74 | j J |
| 75 | k K |
| 76 | l L |
| 77 | m M |
| 78 | n N |
| 79 | o O |
| 80 | p P |
| 81 | q Q |
| 82 | r R |
| 83 | s S |
| 84 | t T |
| 85 | u U |
| 86 | v V |
| 87 | w W |
| 88 | x X |
| 89 | y Y |
| 90 | z Z |
| 96 | KP_0 |
| 97 | KP_1 |
| 98 | KP_2 |
| 99 | KP_3 |
| 100 | KP_4 |
| 101 | KP_5 |
| 102 | KP_6 |
| 103 | KP_7 |
| 104 | KP_8 |
| 105 | KP_9 |
| 106 | KP_* KP_Multiply |
| 107 | KP_+ KP_Add |
| 108 | KP_Enter KP_Separator |
| 109 | KP_- KP_Subtract |
| 110 | KP_. KP_Decimal |
| 111 | KP_/ KP_Divide |
| 112 | F1 |
| 113 | F2 |
| 114 | F3 |
| 115 | F4 |
| 116 | F5 |
| 117 | F6 |
| 118 | F7 |
| 119 | F8 |
| 120 | F9 |
| 121 | F10 |
| 122 | F11 |
| 123 | F12 |
| 188 | , < |
| 189 | - _ |
| 190 | . > |
| 191 | / ? |
| 192 | ` ~ |
| 219 | [ { |
| 220 | \| |
| 221 | ] } |
| 222 | ' " |

</details>

类似的，对鼠标点击的监听反应也可以使用 `addEventListener()` 函数实现。例如：

```javascript
var divElement = document.getElementById('control-box');
document.addEventListener('click', function(event) {
  var targetElement = event.target;
  if (!divElement.contains(targetElement)) {
    if (divElement.style.transform != 'translateX(90%)') {
      divElement.style.transform = 'translateX(90%)';
    }
  }
});
```

其中，`event.target` 返回受点击元素，可以用以判断具体是哪个元素被点击了。

### 倒计时

JavaScript 中，`setInterval()` 函数提供了按照一定时间间隔执行指定函数的功能，通过这个函数便可以编写一个简单的倒计时：

```javascript
let timecount;

function countdown() {
  let timeLeft = newTime(document.getElementById('countdown').innerHTML);
  timeLeft -= 1000;
  document.getElementById('countdown').innerHTML = `${lastTime(timeLeft).hours.toString().padStart(2, '0')}:${lastTime(timeLeft).minutes.toString().padStart(2, '0')}:${lastTime(timeLeft).seconds.toString().padStart(2, '0')}`;
  if (timeLeft <= 3000 && getSetTime() > 3000) {
    document.getElementById('countdown').style.color = '#eb1515';
  }
  if (timeLeft <= 0) {
    document.getElementById('audio').play();
    clearInterval(timecount);
  }
}

function startCountdown() {
  document.getElementById('audio').load();
  let timeLeft = getSetTime();
  if (timeLeft > 0) {
    document.getElementById('countdown').innerHTML = `${lastTime(timeLeft).hours.toString().padStart(2, '0')}:${lastTime(timeLeft).minutes.toString().padStart(2, '0')}:${lastTime(timeLeft).seconds.toString().padStart(2, '0')}`;
    timecount = setInterval(countdown, 1000);
    document.getElementById('countdown').style.color = '';
  } else {
    alert('请输入有效时间');
  }
}

function pauseCountdown() {
  clearInterval(timecount);
}

function resumeCountdown() {
  if (getSetTime() > 0 && timecount != null && timecount >= 1000) {
    timecount = setInterval(countdown, 1000);
  } else {
    alert('倒计时已结束或未开始');
  }
}

function resetCountdown() {
  clearInterval(timecount);
  document.getElementById('countdown').innerHTML = '00:00:00';
  document.getElementById('countdown').style.color = '';
  document.getElementById('audio').load();
}
```

其中的核心部分是 `setInterval(countdown, 1000)` 以及 `clearInterval(timecount)`。

在 `setInterval(countdown, 1000)` 中，`countdown` 是每过一段设定时间后执行的函数，`1000` 则为指定的时间（单位 ms）。这段代码通过先设定 `timeLeft` 并在每次执行时减去 1000 来达到倒计时效果，`clearInterval(timecount)` 则用于清除定时器。

*未完待续……*
