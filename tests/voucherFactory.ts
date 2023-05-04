
import { faker } from '@faker-js/faker';

export function createVoucher(code?: string, discount?: number){
    return {code: code ?? faker.datatype.string(5), discount: discount ?? faker.datatype.number({min: 1, max: 100})}
}

