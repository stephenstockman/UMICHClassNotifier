var accessToken = '';
var aMessageWasSentTempBool=0;
var frequency = 2;

//recieves authorization token from API
function authorize() 
{
	var request = require('request');
    request(
	{
        url: 'https://api-gw.it.umich.edu/token',
        method: 'POST',
        auth: 
		{
            user: 'Client ID',
            pass: 'Client Secret'
        },
        form: 
		{
            'grant_type': 'client_credentials'
        }
    }, function(err, res) 
	{
        var json = JSON.parse(res.body);
        console.log("Access Token:", json.access_token);
        accessToken = json.access_token;
    });
}

//calls API and pipes available seats to setMessage
function getAvailability(end) {
	var baseURL = 'https://api-gw.it.umich.edu/Curriculum/SOC/v1';
	var param = end;
	var request = require('request');
	
    request(
	{
        url: baseURL + param,
        auth: 
		{
            'bearer': accessToken
        }

    }, function(err, res) 
	{
        var jsonContent = JSON.parse(res.body);
        var availCond = jsonContent.getSOCSectionListByNbrResponse.ClassOffered.AvailableSeats;
        sendMail(setMessage(availCond,end));
    });
}

//sets up email and shoots message
function sendMail(mail) 
{
	if(mail != 999)
	{
		aMessageWasSentTempBool=1;
		var mailer = require("nodemailer");
		// Use Smtp Protocol to send Email
		var smtpTransport = mailer.createTransport("SMTP", 
		{
			service: "Gmail",
			auth: 
			{
				user: "Gmail account",
				pass: "Gmail Password"
			}
		});

		smtpTransport.sendMail(mail, function(error, response) {
			if (error) 
			{
				console.log(error);
			} 
			else 
			{
				console.log("Message sent: " + response.message);
			}
			smtpTransport.close();
		});
	}
}

//Select Message to send based on available seats
function setMessage(condition,end) 
{
	if(condition > 0)
	{
		 var mail = {
            from: "Gmail account",
            to: "Who you want to send it to<I suggest same Gmail>",
            subject: 'Class Status',
            html: 'Yeah '+end+' number of spots available= '+condition+'!'
        }
		return mail;
	}
	else if(condition === -99)
		{
			var mail = {
            from: "Gmail accountl",
            to: "Who you want to send it to<I suggest same Gmail>",
            subject: 'Server is up',
            html: 'Server is up and has reset succesfully'
        }
		return mail;
		}
		else
		{
			return 999;
		}
}

//Simple cluster that runs the mai program as a child roces, if child dies parent respawns it
var cluster = require('cluster');
if (cluster.isMaster) 
{
  cluster.fork();

  cluster.on('exit', function(worker, code, signal) 
  {
    cluster.fork();
  });
}

if (cluster.isWorker) 
{
  
	authorize();
	setInterval(function() 
	{
		var date = new Date();
	
		if((date.getSeconds() === 0) && (date.getMinutes() % frequency === 0)) 
		{
			authorize();
		}
		if ((date.getSeconds() === 5) && (date.getMinutes() % frequency === 0) && (aMessageWasSentTempBool===0)) 
		{
			getAvailability('/Terms/2110/Classes/20765');//Example ENGR 151 100-Lecture
			//getAvailability('/Terms/2110/Classes/20766');//Example ENGR 151 Section 101-Lab
			//getAvailability('/Terms/2110/Classes/20767');//Example ENGR 151 Section 102-Lab
			//getAvailability('/Terms/2110/Classes/20768');//Example ENGR 151 Section 103-Lab
			getAvailability('/Terms/2110/Classes/25897');//Example ENGR 151 Section 104-Lab
		}
		//reset once a day this is to ensure it doesnt spam you when a class opens
		if((date.getHours() === 14)&&(date.getMinutes() === 17)&&(date.getSeconds()===45))
		{
			sendMail(setMessage(-99,0));
			aMessageWasSentTempBool=0;
		}

	}, 1000);
}
