package util

import domain.UserView
import org.joda.time.DateTime
import org.joda.time.format.DateTimeFormat

class UserViewParser {

  def parseRow(row: String): UserView = {
    val rowSplitted: Array[String] = row.split("\t")
    
    val timeStamp = rowSplitted(0)
    val appDomain = rowSplitted(1).toInt

    val customerId = rowSplitted(2) match {
      case "UNKNOWN_CUSTOMER" => None
      case "-" => None
      case x => Some(x.toLong)
    }

    val sessionId = rowSplitted(3)
    val action = rowSplitted(4)
    val flowId = rowSplitted(5)
    val searchTerm = rowSplitted(7) match {
      case "-" => None
      case x => Some(x) 
    }
    val recoResults = rowSplitted(8) match {
      case "-" => None
      case x => Some(x.split(',').toSeq.map(x => x.substring(0,x.length-2)))
    }

    val formatter = DateTimeFormat.forPattern("yyyy-MM-dd HH:mm:ss,SSS")
    UserView(DateTime.parse(timeStamp, formatter),
             appDomain,
              customerId,
              sessionId,
              action,
              flowId,
              searchTerm,
              recoResults)
  }
  
  def getTestString: String = 
    """2015-12-10 00:06:42,561	19	3014474010	B49067CFCE2ECCF8DBAEF4E9F4A067AA.jvm_itr-http66_p0120	PDSRECO	25210f33095a4faa4ca2aec12258c76fad5d	n.	-	MF921C05Z-Q11:p,ON321C09F-Q11:p,MF921C05S-Q11:p,V1021C0II-Q11:p,M0921C01C-Q11:p,LA021C00W-Q11:p,FF421C000-J11:p,M5921C0E3-Q11:p,LA021C020-Q11:p,MF921C073-Q11:p,M0921C01N-Q11:p,CF621C005-Q11:p,CR221I049-Q11:p,ES421I04U-K11:p,SG721G008-Q11:p,AN621I03R-802:p,BU311B03G-F11:p,ZA821IA0K-Q11:p,V1021I0BI-Q11:p,VE121I0F8-C11:p,AN621IA12-Q11:p,NL021W00L-B11:p,V1021I0BN-Q11:p,RI911L01P-Q11:p""".stripMargin.trim

  def loadTestFile:Seq[UserView] = {
       val source = scala.io.Source.fromFile("/home/nmahle/Downloads/documents-export-2015-12-15/realtimelogging_userview_tracking.log.2015-12-14")
      val lines: Seq[String] = try source.getLines().toList finally source.close()
       lines.map(parseRow)
     }
}
