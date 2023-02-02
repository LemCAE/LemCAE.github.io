
import os
#import math
val='I_Accept'
check = str(input('''\033[1;31m-------警告-------
该程序将创建多个空文件于当前文件夹中的FileStorage文件夹
这些文件并无害处,但可能占满您的磁盘空间\033[0m
\033[32m-------声明-------
运行该程序的任何后果将由您自行承担(虽然不会有后果)
如您仍要继续,请在下方输入'\033[32;5mI_Accept\033[0m\033[32m'\033[0m
\033[4;33m-------提示-------
若要删除创建的文件,可直接删除FileStorage文件夹\033[0m
>请输入:'''))
if check == val:
    '''
    info = os.statvfs('/')
    frees = info.f_bsize * info.f_bavail / 1024 / 1024
    filenum_f = frees / 114
    filenum_i = math.floor(filenum_f)
    '''
    abs_dir = os.getcwd ()
    os.mkdir('%s\FileStorage' % abs_dir)
    for i in range(0,9999999):
        os.system('fsutil file createnew %s\FileStorage\File-No%s.sys 119537664' % (abs_dir,i))
    exit(0)
else:
    exit(0)
