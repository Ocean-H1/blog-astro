---
title: oh-my-opencode兼容opencode原生agent模式
published: 2026-03-10
description: '介绍几种oh-my-opencode兼容opencode原生agent模式的临时可选方案'
image: https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/opencode.png
tags: [AI]
category: 其他
draft: false 
---
:::note[前言]
问题：最近在使用`opencode` + [oh-my-openagent(原oh-my-opencode)](https://ohmyopenagent.com/)的时候遇到了一个需求: 在使用某些国内模型以及一些简单任务场景时，并不需要其`omoc`内置的agent, 一方面是因为这些内置模式都是对`claude, gemini, codex`等模型进行适配的，另一方面是为了减少一些不必要的tokens消耗。  

原因：当`oh-my-opencode`插件启用之后，会使用内置的agent(例如Sisyphus等)**覆盖** `opencode`原生的 `Plan/Build`模式。至于为什么`omoc`为什么采用覆盖而不是兼容的方案，我也不明白😕，也许会在之后的版本中修改？  

tips: 这篇文章使用的工具版本：`opencode-cli@1.2.24 `, `oh-my-opencode@3.11.1`
:::

## 可选兼容方案

### 1.保留所有agent模式(Sisyphus + Prometheus + Build + Plan ...)
`oh-my-opencode`配置文件位置：
* `.opencode/oh-my-opencode.json （项目级）`
* `~/.config/opencode/oh-my-opencode.json （用户级）`

```json
{
  "sisyphus_agent": {
    "default_builder_enabled": true,
    "replace_plan": false
  }
}
```

### 2.恢复原有的 OpenCode build 和 plan 代理作为主要代理
```json
{
  "sisyphus_agent": {
    "disabled": true
  }
}
```

### 3.仅在需要时加载oh-my-opencode
> 在配置文件中添加以下 shell 函数，以便仅在需要时启用 oh-my-opencode(使用'@')。这样 opencode 就能像以前一样正常工作了
```shell
omo() {
    local config_file="$HOME/.config/opencode/opencode.json"
    local updated_json
    updated_json=$(jq '.plugin = (.plugin // [] | if index("oh-my-opencode") then . else . + ["oh-my-opencode"] end)' "$config_file")
    OPENCODE_CONFIG_CONTENT="$updated_json" opencode "$@"
}
```