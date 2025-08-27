from datetime import datetime
from typing import Dict, Any, Optional

class Review:

    def __init__(self,
                 id: Optional[int],
                 rating: int,
                 comment: str,
                 media_url: Optional[str],
                 date_posted: datetime,
                 user_id: int,
                 product_id: int):

        self.id = id
        self.rating = rating
        self.comment = comment
        self.media_url = media_url
        self.date_posted = date_posted or datetime.utcnow()
        self.user_id = user_id
        self.product_id = product_id

    def to_dict(self) -> Dict[str, Any]:
 
        return {
            'id': self.id,
            'rating': self.rating,
            'comment': self.comment,
            'media_url': self.media_url or '',
            'date_posted': self.date_posted.isoformat(),
            'user_id': self.user_id,
            'product_id': self.product_id
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Review':
     
        try:
            date_posted = datetime.fromisoformat(data.get('date_posted'))
        except (ValueError, TypeError):
            date_posted = datetime.utcnow()

        return cls(
            id=int(data.get('id', 0)),
            rating=int(data.get('rating', 0)),
            comment=data.get('comment', ''),
            media_url=data.get('media_url'),
            date_posted=date_posted,
            user_id=int(data.get('user_id', 0)),
            product_id=int(data.get('product_id', 0))
        )

    def __repr__(self) -> str:

        return f"<Review id={self.id} product_id={self.product_id} rating={self.rating}>"
