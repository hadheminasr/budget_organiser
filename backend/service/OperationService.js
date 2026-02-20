import { Operation } from "../models/Operation.js";
export const OperationService={
    async AddOperation (data){
    return Operation.create ({data})
  },
}
