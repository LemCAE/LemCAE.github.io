#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json,sys,ctypes,os.path,random
import tkinter as tk
from tkinter import StringVar,Menu,messagebox
from tkinter.ttk import *
from os import system

def resource_path(relative_path):
    try:
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.abspath(".")
    return os.path.join(base_path, relative_path)

with open(resource_path('homeworkboard_setting.json'), 'r', encoding="utf-8") as f:
    json_data = json.load(f)
value_name = ['chinese','math','english','physics','chemistry','biology','others']
value_name_chinese = ['语文','数学','英语','物理','化学','生物','其他']
root_window =tk.Tk()
root_window.title('编辑器')
root_window.geometry('500x880+700+60')
root_window.iconbitmap(resource_path('../images/test-icon.ico'))
root_window.resizable(False, False)

entries = []
hidevalues = []
def magic1():
    os.system("shutdown -s -t 30 -c 你还有30秒的时间调出cmd取消关机~")
def magic2():
    os.system("shutdown -s -t 300 -c 你还有300秒的时间调出cmd取消关机~")
magics = [magic1,magic2]
def hide(hide_name):
    json_data["hide_values"][value_name.index(hide_name.rstrip(hide_name[-1]))][hide_name] = "none"
def show(show_name):
    json_data["hide_values"][value_name.index(show_name.rstrip(show_name[-1]))][show_name] = "block"
    
Label(root_window, text='名称').place(x=10, y=0)
Label(root_window, text='内容').place(x=235, y=0)
Label(root_window, text='隐藏').place(x=465, y=0)
for o in range(0, 7):
    for i in range(1, 6):
        value_name_get = value_name[o]
        value_id = value_name_get + str(i)
        label_show = Label(root_window, text=value_name_chinese[value_name.index(value_name_get)] + '[' + str(i) + ']:')
        label_show.place(x=0,y=115*o + 23*(i-1) + 23)
        
        entry_name = value_id
        entry_name = Entry(root_window, textvariable=json_data[value_id], width=58)
        entry_name.place(x=46, y=115*o + 23*(i-1) + 23)
        entry_name.insert(0, json_data[value_id])
        entries.append(entry_name)
        
        stored_hide_value = json_data["hide_values"][o][value_id]
        if stored_hide_value == "block":
            defult_checkbutton = "0"
        else:
            defult_checkbutton = "1"
        checkVar = StringVar(value=defult_checkbutton)
        hide_value = value_id
        hide_value = Checkbutton(root_window, variable=checkVar)
        hide_value.place(x=472, y=115*o + 23*(i-1) + 23)
        hidevalues.append(checkVar)
        
def save_change():
    for o in range(0, 7):
        for i in range(1, 6):
            value_name_get = value_name[o]
            value_id = value_name_get + str(i)
            json_data[value_id] = entries[5*o + i - 1].get()
            hide_statute = hidevalues[5*o + i - 1].get()
            if hide_statute == "1":
                hide(value_id)
            else:
                show(value_id)
    with open(resource_path('homeworkboard_setting.json'), 'w', encoding="utf-8") as g:
        json.dump(json_data, g,indent=4, ensure_ascii=False)
def all_exit():
    root_window.destroy()
    exit()
def exit_without_save():
    exit_warning = messagebox.askokcancel('警告', '点确定后刚刚就白改了呦,真的要退出吗?', icon='warning')
    if exit_warning == True:
        root_window.destroy()
        exit()
    else:
        pass
def show_about():
    messagebox.showinfo('关于', '''这是一个配套网页作业板的编辑器！
是由LemCAE用他那孱弱的技术堆出来的!
在这里，可以配置每项作业的内容以及是否显示它们
然后就没有然后了~

Last Update:2023/10/21''')
def set():
    messagebox.showinfo('设置', '还没写啦')
def reset_setting():
    messagebox.showinfo('恢复初始设置', '就这么几个空的话就请自己删啦')
def unknown():
    ukn = messagebox.askokcancel('???', '''没想到这都会被你发现~
接下来可能是一些奇妙的东西呦,要继续吗?
Tips:后果自负~''')
    if ukn == True:
        magics[random.randint(0,len(magics))-1]()
    else:
        pass
menubar = Menu(root_window)
menubar.add_command(label = "关于", command=show_about)
menubar.add_command(label = "设置", command=set)
edit_menu = Menu(menubar, tearoff = False)
edit_menu.add_command(label = "恢复初始设置" , command=reset_setting)
menubar.add_cascade(label="编辑", menu=edit_menu)
menubar.add_command(label = "退出", command=exit_without_save)
menubar.add_command(label = " ", command=unknown)
root_window.config(menu = menubar)
button_save = Button(root_window, text='保存但不退出', command=save_change)
button_save.place(x=220,y=830)
botton_save_exit = Button(root_window, text='保存并退出')
botton_save_exit.config(command = lambda: [save_change(),all_exit()])
botton_save_exit.place(x=310,y=830)
button_exit = Button(root_window, text='放弃更改', command=exit_without_save)
button_exit.place(x=400,y=830)

ctypes.windll.shcore.SetProcessDpiAwareness(1)
ScaleFactor=ctypes.windll.shcore.GetScaleFactorForDevice(0)
root_window.tk.call('tk', 'scaling', ScaleFactor/75)
root_window.mainloop()
exit()