class StateValue
{
    valueProp = null;
    setter = null;
    constructor(getter, setter)
    {
        this.setter = setter;
        this.valueProp = getter;
    }

    get value() {
        return this.valueProp;
    }

    set value(val) {
        this.setter(val)
    }
}

export const valueState = (state) => {
    const [getter, setter] = state;
    return new StateValue(getter, setter)
}