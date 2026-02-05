import {Schema,model} from 'mongoose'; 

const addressSchema=new Schema({
    street:{
        type:String,
        required:true,
    },
    city:{
        type:String,
        required:true,
    },
    state:{
        type:String,
        required:true,
    },
    zipCode:{
        type:String,
        required:true,
    },
});

const addressModel=model('Address',addressSchema);

export default addressModel;