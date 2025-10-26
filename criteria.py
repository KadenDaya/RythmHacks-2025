import dataInput

def rankRatio(self):
    percentageUsed = dataInput.cardData.getPercentageUsed()
    #very bad
    if percentageUsed>0.5:
        return 1
    elif percentageUsed>0.3:
        return 2
    #very good
    elif percentageUsed>0:
        return 3
    
def checkAge(self):
    age = dataInput.cardData.getAge
    if age<3:
        #can be worked on
        return 0
    else:
        #good
        return 1
    
    