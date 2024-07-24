---
title: 封装Antd表单组件
published: 2022-09-24
draft: false
description: 'React封装一个简单的Antd表单组件，巩固高阶组件的使用'
image: 'https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/react.png'
tags: [React]
category: 前端
---

```javascript
import React, { Component } from 'react'
import {UserOutlined,LockOutlined} from '@ant-design/icons';

// 高阶组件
const MFormCreate = Comp => {
    return class extends Component {
        constructor(props) {
            super(props)
            this.options = {}   // 各个字段的选项值 它的变化不会触发组件重新渲染
            this.state = {} // 各个字段的值
        }
        // 处理表单项输入事件
        handleChange = (e) => {
            const { name, value } = e.target
            this.setState({
                [name]: value
            }, () => {
                // 校验
                this.validateField(name)
            })
        }
        // 表单项的校验
        validateField = (fieldName) => {
            const { rules } = this.options[fieldName]

            const ret = rules.some(rule => {
                if (rule.required) {
                    // 输入为空 要显示错误信息
                    if (!this.state[fieldName]) {
                        this.setState({
                            [fieldName + 'Message']: rule.message
                        })
                        return true // 校验失败
                    }
                }
            })
            if (!ret) {
                this.setState({
                    [fieldName + 'Message']: ''
                })
            }
            return !ret 
        }
        handleFocus = e => {
            const fieldName = e.target.name
            this.setState({
                [fieldName + 'Focus']: true
            })
        }
        getFieldDecorator = (fieldName, option) => {
            // 设置字段选项配置
            this.options[fieldName] = option
            // 返回包装处理后的Input组件
            return (InputComp) => {
                return <div>
                    {   
                        // 克隆一份并添加需要的属性
                        React.cloneElement(InputComp, {
                            name: fieldName,
                            value: this.state[fieldName] || '',
                            onChange: this.handleChange,
                            onFocus: this.handleFocus
                        })
                    }
                </div>
            }
        }
        // 验证全部表单项
        validateFields = (cb) => {
            const rets = Object.keys(this.options).map(fieldName => this.validateField(fieldName))
            const ret = rets.every(v => v === true)
            cb(ret)
        }
        // 判断控件是否被点击过
        isFieldTouched = fieldName => !!this.state[fieldName + 'Focus']
        // 获取控件的错误信息
        getFieldError = fieldName => this.state[fieldName + 'Message']
        // 表单相关API
        form = () => {
            return {
                getFieldDecorator: this.getFieldDecorator,
                validateFields: this.validateFields,
                isFieldTouched: this.isFieldTouched,
                getFieldError: this.getFieldError
            }
        }
        render() {
            return (
                <div>
                    <Comp {...this.props} form={this.form()}></Comp>
                </div>
            );
        }
    }

}
class FormItem extends Component {
    render() {
        return (
            <div>
                {this.props.children}
                {/* 错误信息展示 */}
                {
                    this.props.validateStatus && (
                        <p style={{ color: 'red' }}>{this.props.help}</p>
                    )
                }
            </div>
        );
    }
}
// 对input的扩展
class Input extends Component {
    render() {
        return (
            <div>
                {this.props.prefix}
                <input type="text" {...this.props}/>
            </div>
        );
    }
}

class MForm extends Component {
    // 处理submit点击事件
    handleSubmit = () => {
        this.props.form.validateFields(isValid => {
            if (isValid) {
                alert('校验成功!')
            } else {
                alert('校验失败，重新输入!')
            }
        })
    }
    render() {
        const { getFieldDecorator, isFieldTouched, getFieldError } = this.props.form
        const usernameError = isFieldTouched('username') && getFieldError('username')
        const passwordError = isFieldTouched('password') && getFieldError('password')
        return (
            <div>
                <FormItem validateStatus={usernameError ? 'error' : ''} help={usernameError || ''}>
                    {
                        getFieldDecorator('username', {
                            rules: [
                                {
                                    required: true,
                                    message: '请填写用户名!'
                                }
                            ]
                        })(<Input prefix={<UserOutlined />} type="text"></Input>)
                    }
                </FormItem>
                <FormItem validateStatus={passwordError ? 'error' : ''} help={passwordError || ''}>
                    {
                        getFieldDecorator('password', {
                            rules: [
                                {
                                    required: true,
                                    message: '请填写密码!'
                                }
                            ]
                        })(<Input prefix={<LockOutlined />} type="password"></Input>)
                    }
                </FormItem>


                <input type="button" value="登录" onClick={this.handleSubmit} />
            </div>
        )
    }
}
export default MFormCreate(MForm)
```

