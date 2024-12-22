from fastapi import APIRouter, Depends, HTTPException
from ..core.deps import get_current_admin_user
from ..db.mongodb import get_database
from ..models.membership import MembershipPlan

router = APIRouter()

@router.get("/settings/membership")
async def get_membership_settings(current_user = Depends(get_current_admin_user)):
    try:
        db = await get_database()
        
        # 获取会员方案
        plans = await db.membership_plans.find({}).to_list(None)
        
        # 获取支付配置
        payment_config = await db.payment_config.find_one({})
        
        return {
            "success": True,
            "data": {
                "plans": {
                    plan["type"]: {
                        "price": plan["price"],
                        "benefits": plan["benefits"]
                    } for plan in plans
                },
                "payment": payment_config
            }
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))

@router.post("/settings/membership/plans")
async def update_membership_plans(
    plans: dict,
    current_user = Depends(get_current_admin_user)
):
    try:
        db = await get_database()
        
        # 清除旧的方案
        await db.membership_plans.delete_many({})
        
        # 插入新的方案
        for plan_type, plan_data in plans.items():
            await db.membership_plans.insert_one({
                "type": plan_type,
                "price": float(plan_data["price"]),
                "benefits": plan_data["benefits"],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            })
        
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))

@router.post("/settings/membership/payment")
async def update_payment_config(
    config: dict,
    current_user = Depends(get_current_admin_user)
):
    try:
        db = await get_database()
        
        # 更新支付配置
        await db.payment_config.update_one(
            {},
            {"$set": {
                **config,
                "updated_at": datetime.utcnow()
            }},
            upsert=True
        )
        
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e)) 