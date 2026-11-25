这是一篇关于 GitHub Action 的笔记！

## 关于 GitHub Action

> GitHub Actions is a continuous integration and continuous delivery (CI/CD) platform that allows you to automate your build, test, and deployment pipeline. You can create workflows that build and test every pull request to your repository, or deploy merged pull requests to production.
>
> GitHub Actions goes beyond just DevOps and lets you run workflows when other events happen in your repository. For example, you can run a workflow to automatically add the appropriate labels whenever someone creates a new issue in your repository.
>
> GitHub provides Linux, Windows, and macOS virtual machines to run your workflows, or you can host your own self-hosted runners in your own data center or cloud infrastructure.
>
> *GitHub Actions 是一个持续集成和持续交付（CI/CD）平台，可用于自动化构建、测试和部署管道。您可以创建工作流来构建和测试对存储库的每个拉取请求，或将合并的拉取请求部署到生产环境。*
>
> *GitHub Actions 不仅仅局限于 DevOps，还允许您在仓库中发生其他事件时运行工作流。例如，您可以运行工作流，以便在有人在您的仓库中创建新问题时自动添加适当的标签。*
>
> *GitHub 提供 Linux、Windows 和 macOS 虚拟机来运行您的工作流，或者您可以在自己的数据中心或云基础设施中托管自己的自托管运行器。*

## 基本用法

### 创建 workflow 文件

workflow 文件是操作执行的依据，其中规定了工作流名称、触发事件、运行平台以及运行操作。文件应被保存于 `.github/workflows` 目录下。文件的名称没有特殊限制，但是文件类型必须是 `yml`。

workflow 文件的基本格式如下：

```yaml
name: Build EXE

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: windows-latest

    steps:
    - name: Check out the repository
      uses: actions/checkout@v4

    - name: Set up Python
      uses: actions/setup-python@v3
      with:
        python-version: 3.11

    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install pyinstaller pillow

    - name: Build EXE
      run: |
        pyinstaller --onefile --windowed pic-to-pdf.py
        mkdir output
        move dist\pic-to-pdf.exe output\pic-to-pdf.exe

    - name: Upload EXE
      uses: actions/upload-artifact@v2
      with:
        name: pic-to-pdf_exe
        path: output/pic-to-pdf.exe
```

- `name`：规定工作流的名称
- `on`：规定工作流的触发事件，上例中为 `main` 分支上有 `push` 及 `pull_request` 活动时触发（[查看所有事件类型](https://docs.github.com/zh/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows)）
- `jobs`：规定工作流的具体操作
  - `build`：这一段操作的名称（上例中也只有一段操作）
  - `runs-on`：规定操作运行平台，上例为 `windows-latest`（[查看所有运行平台](https://docs.github.com/zh/actions/writing-workflows/choosing-where-your-workflow-runs/choosing-the-runner-for-a-job)）
  - `steps`：规定具体操作：
    - `name`：对这一步操作的描述
    - `Check out the repository`：使用 `actions/checkout@v4` 检查代码库
    - `Set up Python`：安装 Python 环境，使用 `actions/setup-python@v3` 并指定版本 `3.11`
    - `Install dependencies`：通过命令行安装依赖
    - `Build EXE`：打包 exe 文件
    - `Upload EXE`：使用 `actions/upload-artifact@v2` 上传构建产物（可在对应 Action 的 Artifacts 中下载）

### 触发 GitHub Action

每当定义的事件发生时，workflow 文件设定的工作流程就会自动进行，不需要额外操作。

## 更多操作

### 自动将文件发布到 GitHub Release

示例：

```yaml
name: Build and Release EXE

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: windows-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.x'

    - name: Install dependencies
      run: pip install -r requirements.txt

    - name: Build EXE
      run: pyinstaller --onefile --noconsole pic-to-pdf.py

    - name: Archive EXE
      uses: actions/upload-artifact@v3
      with:
        name: pic-to-pdf-exe
        path: dist/pic-to-pdf.exe

    - name: Create GitHub Release
      id: create_release
      uses: actions/create-release@v1
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      with:
        tag_name: ${{ github.ref }}
        release_name: Release ${{ github.ref }}
        draft: false
        prerelease: false

    - name: Upload EXE to Release
      uses: actions/upload-release-asset@v1
      with:
        upload_url: ${{ steps.create_release.outputs.upload_url }}
        asset_path: dist/pic-to-pdf.exe
        asset_name: pic-to-pdf.exe
        asset_content_type: application/octet-stream
```

这里工作流被设定为在有新版本 tag 推送时触发（例如 `git tag v1.0.0` 及 `git push origin v1.0.0`）：

- `Create GitHub Release`：创建 GitHub Release，使用当前标签作为版本号。
- `Upload EXE to Release`：将生成的 exe 文件上传到刚刚创建的 Release 中（也可以用如 [Upload to Release](https://github.com/marketplace/actions/upload-to-release) 等 Action）。
- `GITHUB_TOKEN`：GitHub 提供的自动化 token，用于发布和上传资源到 Release。
