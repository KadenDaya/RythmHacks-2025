class date:
    def __init__ (self, year, month, day):
        self.year = year
        self.month = month
        self.day = day

class paymentData:
    def __init__ (self,purchaseYear, purchaseMonth, purchaseDay, paymentYear, paymentMonth, paymentDay, cost):
        self.purchaseDate = date(purchaseYear, purchaseMonth, purchaseDay)
        self.paymentDate = date(paymentYear, paymentMonth, paymentDay)
        self.cost = cost
        pass
    def paymentData(self, purchaseDate, paymentDate, cost):
        self.purchaseDate = purchaseDate
        self.paymentDate = paymentDate
        self.cost = cost
        pass
    


class cardData:
    def __init__(self, card):
        self.card = card 
    count = 0
    cardLimit = 0.0
    transactionList = []
    

    def cardData(self, count, cardLimit, transactionList):
        #Call the app to submit the current data to the server, then set that as one of the values [t, a, a,a]
        self.count = count
        self.cardLimit = cardLimit
        self.transactionList = transactionList
        pass
