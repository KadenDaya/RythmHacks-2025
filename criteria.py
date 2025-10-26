import dataInput

class critera:
    
    def __init__(self, cardData):
        self.cardData = cardData

    def rankRatio(self):
        percentageUsed = self.cardData.getPercentageUsed()
    #very bad
        if percentageUsed>=0.5:
            return 1
        elif percentageUsed>=0.3:
            return 2
    #very good
        elif percentageUsed>=0:
            return 3
        else:
            return -1
    
    def checkAge(self):

        age = self.cardData.getAge()
        if age<25:
            #can be worked on
            return 0
        else:
            #good
            return 1
    def messageReturnCodedName(self):
        if  self.rankRatio() == 1:
            if self.checkAge()==0:
                #really needs improvement in pay ratio, and to keep up a healthy score for a longer period of time
                return 1
            else:
                #really needs improvement in pay ratio
                return 2
        elif self.rankRatio() == 2:
            if self.checkAge()==0:
            #needs improvement in pay ratio, and to keep up a healthy score
                return 3
            else:
            #needs improvement in pay ratio
                return 4
        else:
            if self.checkAge()==0:
                #good pay ratio, just keep it healthy for longer
                return 5
            else:
                #perfect, maybe become a verified user of other credit 
                return 6
    
    
    