import {createContainer} from '@/util';
import Component from './Component';

export default createContainer(Component, (state, ownProps)=>{
    console.log(state, ownProps);
    return {

    };
});