import FormItem from '@/components/item/formItem/FormItem.vue';
/**
 * 提供默认配置，可以将一些系统配置放到baseOptions中，而不是直接在配置文件中展开书写
 * 这么做的目的是简化属性配置文件，只保留关键信息
 * 基础option配置
 * */
const BaseOptionConfig: Record<string, any> = {
    Collapse: {
        component: FormItem,
        dataType: 'Collapse',
        defaultValue: 0
    },
    CollapsePane: {
        component: FormItem,
        dataType: 'CollapsePane'
    },
    Tabs: {
        component: FormItem,
        dataType: 'Tabs',
        defaultValue: 0
    },
    TabPane: {
        component: FormItem,
        dataType: 'TabPane'
    },
    TabsCard: {
        component: FormItem,
        dataType: 'Tabs',
        defaultValue: 0,
        attr: {
            type: 'border-card'
        }
    },
    Slider: {
        component: FormItem,
        dataType: 'Slider'
    },
    String: {
        component: FormItem,
        dataType: 'String'
    },
    Number: {
        component: FormItem,
        dataType: 'Number'
    },
    Radio: {
        component: FormItem,
        dataType: 'Radio'
    },
    RadioItem: {
        component: FormItem,
        dataType: 'RadioItem'
    },
    RadioButton: {
        component: FormItem,
        dataType: 'RadioButton'
    },
    RadioButtonItem: {
        component: FormItem,
        dataType: 'RadioButtonItem'
    },
    Boolean: {
        component: FormItem,
        dataType: 'Boolean'
    },
    Color: {
        component: FormItem,
        dataType: 'Color'
    },
    TextArea: {
        component: FormItem,
        dataType: 'TextArea'
    },
    Flex: {
        component: FormItem,
        dataType: 'Flex'
    },
    Select: {
        component: FormItem,
        dataType: 'Select',
        //为什么做了选择之后却不能够改变字体呢？
    }//用来选择函数的，更改字体要怎么做呢？？
};

// 格式化属性表单配置
//轨道表单格式化
//为什么，明明里面的参数都是一样的
export function mappingFormItem(componentName: string, mergeOptions: Record<string, any>) {
    return {
        ...(BaseOptionConfig[componentName] || {}),
        ...mergeOptions
    };
}