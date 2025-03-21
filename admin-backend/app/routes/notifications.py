from fastapi import APIRouter, HTTPException, Depends, Query
from app.middleware.auth import JWTBearer
from app.models import Notification
from beanie import PydanticObjectId

router = APIRouter()

# Get paginated list of user notifications
@router.get("/notifications/{user_id}", dependencies=[Depends(JWTBearer())])
async def get_notifications(
    user_id: str,
    skip: int = Query(0, ge=0),  # Number of items to skip
    limit: int = Query(10, ge=1)  # Number of items to fetch
):
    """
    Get a paginated list of notifications for a user.
    """
    try:
        user_id = PydanticObjectId(user_id)
        # Get total count of user notifications
        total_count = await Notification.find(Notification.user_id == user_id).count()

        # Get paginated notifications
        notifications = await Notification.find({
            "$and": [
                    {"is_read": False},
                    {"user_id": user_id}
                ]
        }).skip(skip).limit(limit).to_list()

        notifications_list = []

        for notification in notifications:
            notification_dict = notification.dict()
            notification_dict["id"] = str(notification_dict["id"])
            notification_dict["user_id"] = str(notification_dict["user_id"])
            notifications_list.append(notification_dict)

        return {
            "total": total_count,
            "skip": skip,
            "limit": limit,
            "notifications": notifications_list
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

# Mark notification as read
@router.put("/notifications/{notification_id}/read", dependencies=[Depends(JWTBearer())])
async def mark_notification_as_read(notification_id: str):
    notification = await Notification.get(notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notification.is_read = True
    await notification.save()
    return {"message": "Notification marked as read"}
