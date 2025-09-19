public class FlightAgent {

    @InvocableMethod(label='Find Flights' description='Finds available flights')
    public static List<FlightResponse> findFlights(List<FlightRequest> req) {
		List<FlightResponse> flightResponses = new List<FlightResponse>();

        // Hardcoding the data for example and not focusing on how we retrieve it.
        // However, consider that we are receiving available flights from a service,
        // and then iterating through the data to generate the final response.

        List<Flight> flights = new List<Flight>();
        Flight f1 = new Flight('IX 2814', 1, false, 1000l, 20.20d, 70);
        Flight f2 = new Flight('6E 488', 2, false, 2000l, 15.15d, 120);
        Flight f3 = new Flight('6E 523', 1, false, 3000l, 13.14d, 75);
        Flight f4 = new Flight('6E 6166', 2, false, 4000l, 14.14d, 130);
        flights.add(f1);  flights.add(f2); flights.add(f3); flights.add(f4);
        AvailableFlight availableFlights = new AvailableFlight();
        availableFlights.flights = flights;

        FlightResponse fr = new FlightResponse();
        fr.aFlight = availableFlights;
        flightResponses.add(fr);

        return flightResponses;
    }

    public class FlightRequest {

        @InvocableVariable(description = 'Origin city of the flight')
        public String originCity;

        @InvocableVariable (description = 'Destination city of the flight')
        public String destinationCity;

        @InvocableVariable (description = 'Date of travel')
        public Date dateOfTravel;

        @InvocableVariable (description = 'Additional filters like price and discount')
        public Filter filters;
    }

    public class Filter {

        @InvocableVariable
        public Long price;

        @InvocableVariable
        public Double discountPercentage;
    }


    public class FlightResponse {
        @InvocableVariable (description = 'List of all the Available flights')
        public AvailableFlight aFlight;
    }

    public class AvailableFlight {
        public List<Flight> flights;
    }

    public class Flight {

        @InvocableVariable
        public String flightId;

        @InvocableVariable
        public Integer numLayovers;

        @InvocableVariable
        public Boolean isPetAllowed;

        @InvocableVariable
        public Long price;

        @InvocableVariable
        public Double discountPercentage;

        @InvocableVariable
        public Integer durationInMin;

        public Flight(String flightId, Integer numLayovers, Boolean isPetAllowed,
                      Long price, Double discountPercentage, Integer durationInMin) {
            this.flightId = flightId;
            this.numLayovers = numLayovers;
            this.isPetAllowed = isPetAllowed;
            this.price = price;
            this.discountPercentage = discountPercentage;
            this.durationInMin = durationInMin;
        }
    }
}