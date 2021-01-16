# Obsidian AutoLinker

> 自动为 Obsidian 文档添加双向链接的插件

## 使用方式

本插件会自动寻找 Vault 内的所有 Markdown 文档，以及 Markdown 文档里的 `link_titles`
FrontMatter，以这些作为链接，当有字段与文档名或 `link_titles` 指定的标题名匹配，则自动添加双向链接。样例如下：

文档名：三大特性.md

```markdown
---
link_titles:
  - 原子性
  - 可见性
  - 有序性
---

## 原子性

原子性指提供互斥访问，同一时刻只能有一个线程对数据进行操作（Atomic、CAS 算法、synchronized、Lock）。

三大特性
```

选取要添加双向链接的区域，本样例为标题到结束，使用 `Ctrl+Alt+K` 自动添加双向链接

```markdown
---
link_titles:
  - 原子性
  - 可见性
  - 有序性
---

## [[#原子性|原子性]]

原子性指提供互斥访问，同一时刻只能有一个线程对数据进行操作（Atomic、CAS 算法、synchronized、Lock）。

[[三大特性]]
```
