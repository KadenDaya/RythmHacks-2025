
class date:
    year = 0
    month = 0
    day = 0

#need to be integers
    def __init__ (self, year, month, day):
        self.year = year
        self.month = month
        self.day = day

#     def getyear(self):
#         return self.year
#     def getmonth(self):
#         return self.month
#     def getday(self):
#         return self.day


class transactionData:
    def __init__ (self,purchaseYear, purchaseMonth, purchaseDay, paymentYear, paymentMonth, paymentDay, cost):        
        self.purchaseDate = date(purchaseYear, purchaseMonth, purchaseDay)
        self.paymentDate = date(paymentYear, paymentMonth, paymentDay)
        self.cost = cost
        pass

    


class cardData:
    percentageUsed = 0.0
    def __init__(self, cardLimit, transactionList, ageOfCard):
        #Call the app to submit the current data to the server, then set that as one of the values [t, a, a,a]
        self.cardLimit = cardLimit
        self.transactionList = transactionList
        self.ageOfCard = ageOfCard
        pass
    def getAge(self):
        return self.ageOfCard
    def organizeDataSet(self, transactionList):
        #organize list oldest transactions to newest
        temp = 0
        changed = True
        while changed == True:
            changed = False
            for i in range(len(transactionList)-1):
            #bubble sort to sort the data, finding spikes
                if transactionList[i].purchaseDate.year>transactionList[i+1].purchaseDate.year:
                    temp = transactionList[i]
                    transactionList[i]=transactionList[i+1]
                    transactionList[i+1]=temp
                    changed=True
                elif transactionList[i].purchaseDate.year==transactionList[i+1].purchaseDate.year:
                    if transactionList[i].purchaseDate.month>transactionList[i+1].purchaseDate.month:
                        temp = transactionList[i]
                        transactionList[i]=transactionList[i+1]
                        transactionList[i+1]=temp
                        changed=True
                    elif transactionList[i].purchaseDate.month==transactionList[i+1].purchaseDate.month:
                        if transactionList[i].purchaseDate.day>transactionList[i+1].purchaseDate.day:
                            temp = transactionList[i]
                            transactionList[i]=transactionList[i+1]
                            transactionList[i+1]=temp
                            changed=True
    def percentageOfCardUsed(self, transactionList, cardLimit):
        #find percentage of card being used, calculate in terms of monthly usage based on 10 most recent months
        unpaidDebts = 0.0
        for i in range(len(transactionList)):
            if transactionList[i].paymentDate.year <0:
                unpaidDebts += transactionList[i].cost
            if cardLimit > 0 :
                percentageUsed = unpaidDebts/cardLimit
                self.percentageUsed = percentageUsed
    def getPercentageUsed(self):
        return self.percentageUsed
            
        
        
        

