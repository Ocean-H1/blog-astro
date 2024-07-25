---
title: Leetcode->合并K个升序链表
category: 算法
description: Leetcode->合并K个升序链表
published: 2022-09-18T00:00:00.000Z
tags:
  - LeetCode
draft: false
image: 'https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/leetcode.png'
---

## 题目

给你一个链表数组，每个链表都已经按升序排列。

请你将所有链表合并到一个升序链表中，返回合并后的链表。

**示例 1：**

```
输入：lists = [[1,4,5],[1,3,4],[2,6]]
输出：[1,1,2,3,4,4,5,6]
解释：链表数组如下：
[
  1->4->5,
  1->3->4,
  2->6
]
将它们合并到一个有序链表中得到。
1->1->2->3->4->4->5->6
```

**示例 2：**

```
输入：lists = []
输出：[]
```

**示例 3：**

```
输入：lists = [[]]
输出：[]
```

**提示：**

- `k == lists.length`
- `0 <= k <= 10^4`
- `0 <= lists[i].length <= 500`
- `-10^4 <= lists[i][j] <= 10^4`
- `lists[i]` 按 **升序** 排列
- `lists[i].length` 的总和不超过 `10^4`

## 题解:key:

### ①顺序合并

:::tip

暴力法，用一个变量维护，按照顺序两两合并

:::

```c++
/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode() : val(0), next(nullptr) {}
 *     ListNode(int x) : val(x), next(nullptr) {}
 *     ListNode(int x, ListNode *next) : val(x), next(next) {}
 * };
 */
class Solution {
public:
    ListNode* mergeTwoLists(ListNode* a,ListNode* b) {
        if((!a) ||(!b)) return a ? a : b;
        ListNode head,*tail = &head,*aPtr = a,*bPtr = b;
        while(aPtr && bPtr) {
            if(aPtr->val < bPtr->val) {
                tail->next = aPtr;
                aPtr=aPtr->next;
            }else{
                tail->next = bPtr;
                bPtr = bPtr->next;
            }
            tail = tail->next;
        }
        tail->next = (aPtr ? aPtr : bPtr);
        return head.next;
    }
    ListNode* mergeKLists(vector<ListNode*>& lists) {
        ListNode *ans = nullptr;
        for (size_t i = 0; i < lists.size(); ++i) {
            ans = mergeTwoLists(ans, lists[i]);
        }
        return ans;
    }
};
```

### ②分治合并

:::tip

参考：https://leetcode.cn/problems/merge-k-sorted-lists/solution/he-bing-kge-pai-xu-lian-biao-by-leetcode-solutio-2/

对方法①的优化，大幅减少了合并次数

第一轮合并以后，K个链表被合并成了K/2个链表，然后是k/4,k/8等等，重复这一过程，直到得到最终的链表

:::

![img](https://pic.leetcode-cn.com/6f70a6649d2192cf32af68500915d84b476aa34ec899f98766c038fc9cc54662-image.png)

```javascript
/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode() : val(0), next(nullptr) {}
 *     ListNode(int x) : val(x), next(nullptr) {}
 *     ListNode(int x, ListNode *next) : val(x), next(next) {}
 * };
 */
class Solution {
public:
    ListNode* mergeTwoLists(ListNode* a,ListNode* b) {
        if((!a) ||(!b)) return a ? a : b;
        ListNode head,*tail = &head,*aPtr = a,*bPtr = b;
        while(aPtr && bPtr) {
            if(aPtr->val < bPtr->val) {
                tail->next = aPtr;
                aPtr=aPtr->next;
            }else{
                tail->next = bPtr;
                bPtr = bPtr->next;
            }
            tail = tail->next;
        }
        tail->next = (aPtr ? aPtr : bPtr);
        return head.next;
    }
    ListNode* merge(vector <ListNode*> &lists,int l,int r) {
        if(l == r ) return lists[l];
        if(l > r ) return nullptr;
        int mid = (l+r) >> 1;
        return mergeTwoLists(merge(lists,l,mid),merge(lists,mid+1,r));
    }
    ListNode* mergeKLists(vector<ListNode*>& lists) {
        return merge(lists,0,lists.size() - 1);
    }
};
```



