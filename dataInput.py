
class date:
    year = 0
    month = 0
    day = 0

    def __init__ (self, year, month, day):
        self.year = year
        self.month = month
        self.day = day

    def getyear(self):
        return self.year
    def getmonth(self):
        return self.month
    def getday(self):
        return self.day


class transactionData:
    def __init__ (self,purchaseYear, purchaseMonth, purchaseDay, paymentYear, paymentMonth, paymentDay, cost):        
        self.purchaseDate = date(purchaseYear, purchaseMonth, purchaseDay)
        self.paymentDate = date(paymentYear, paymentMonth, paymentDay)
        self.cost = cost
        pass
    


class cardData:
    count = 0
    cardLimit = 0.0
    transactionList = []
    ageOfCard = 0
    
    def __init__(self, count, cardLimit, transactionList, ageOfCard):
        #Call the app to submit the current data to the server, then set that as one of the values [t, a, a,a]
        self.count = count
        self.cardLimit = cardLimit
        self.transactionList = transactionList
        self.age = ageOfCard
        pass
    def percentageOfCardUsedAVG(self, transactionList, cardLimit):
        #find percentage of card being used, calculate in terms of monthly usage based on 10 most recent months
        for i in range(11):
            tenMonthList = []
            if transactionList[i].getmonth() == some_
                # Add your logic here
                pass
        return 0 