import voucherRepository from "repositories/voucherRepository"
import voucherService from "services/voucherService"
import { createVoucher } from "./voucherFactory"
import { faker } from "@faker-js/faker"

describe("voucherService test suit", () => {
    type IVoucher = { code: string, discount:number, used?: boolean}
    let vouchers: IVoucher[]

    jest.spyOn(voucherRepository, "getVoucherByCode").mockImplementation((code:string): any => {
        return vouchers.find(e=> e.code === code)
    })

    jest.spyOn(voucherRepository, "createVoucher").mockImplementation((code:string,discount:number): any => {
        return vouchers.push({code,discount})
    })
    jest.spyOn(voucherRepository, "useVoucher").mockImplementation((code:string): any => {
        const voucher = vouchers.find(e=>e.code === code)
        voucher.used = true
    })

    beforeEach(()=>{
        vouchers = [] 
    })
    describe("Test createVoucher", ()=> {
        
        it("should return void and create voucher if code is not found in repository", async () => {
            const voucher = createVoucher()
    
            const result = await voucherService.createVoucher(voucher.code,voucher.discount) 
            expect(result).toBeUndefined()
            expect(vouchers).toEqual([voucher])
        })
    
        it("should return error and not create voucher", async () => {
            const voucher = createVoucher()
            vouchers.push(voucher) 
    
            const promise = voucherService.createVoucher(voucher.code,voucher.discount)
            
            expect(promise).rejects.toEqual({ type: "conflict", message: 'Voucher already exist.' })
            expect(vouchers).toEqual([voucher])
        })
    })
    describe("Test applyVoucher", ()=> {
        it(" Should return error if voucher does not exist", async () => {
            const voucher = createVoucher()   
            const promise = voucherService.applyVoucher(voucher.code,200)
            
            expect(promise).rejects.toEqual({ type: "conflict", message: 'Voucher does not exist.' })
        })
        it(" Should return object with applied true if voucher exists and amount is = 100", async () => {
            const voucher = createVoucher()
            vouchers.push(voucher)
            const amount = 100
            const result = await voucherService.applyVoucher(voucher.code,amount)
            
            expect(result).toEqual({ amount,
                discount: voucher.discount,
                finalAmount: amount - (amount * (voucher.discount / 100)),
                applied: true})
            expect(vouchers[0].used).toEqual(true)
        })
        it(" Should return object with applied true if voucher exists and amount is > 101", async () => {
            const voucher = createVoucher()
            vouchers.push(voucher)
            const amount = faker.datatype.number({min:101})
            const result = await voucherService.applyVoucher(voucher.code,amount)
            
            expect(result).toEqual({ amount,
                discount: voucher.discount,
                finalAmount: amount - (amount * (voucher.discount / 100)),
                applied: true})
            expect(vouchers[0].used).toEqual(true)
        })
        it(" Should return object with applied false if voucher exists and amount is < 98", async () => {
            const voucher = createVoucher()
            vouchers.push(voucher)
            const amount = faker.datatype.number({max:98})
            const result = await voucherService.applyVoucher(voucher.code,amount)
            
            expect(result).toEqual({ amount,
                discount: voucher.discount,
                finalAmount: amount,
                applied: false})
            expect(vouchers[0].used).toEqual(undefined)
        })
        it(" Should return object with applied false if voucher exists and amount is = 99", async () => {
            const voucher = createVoucher()
            vouchers.push(voucher)
            const amount = 99
            const result = await voucherService.applyVoucher(voucher.code,amount)
            
            expect(result).toEqual({ amount,
                discount: voucher.discount,
                finalAmount: amount,
                applied: false})
            expect(vouchers[0].used).toEqual(undefined)
        })
    })

})