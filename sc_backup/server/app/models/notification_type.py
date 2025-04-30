from enum import Enum

class NotificationType(Enum):
    CONTRIBUTION = 'contribution'
    LOAN = 'loan'
    INVESTMENT = 'investment'
    GROUP = 'group'
    SYSTEM = 'system'
    PAYMENT = 'payment'
    REMINDER = 'reminder'

    def __str__(self):
        return self.value