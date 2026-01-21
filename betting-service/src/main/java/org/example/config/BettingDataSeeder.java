//package org.example.config;
//
//import lombok.RequiredArgsConstructor;
//import org.example.entity.Event;
//import org.example.entity.Market;
//import org.example.entity.Odd;
//import org.example.entity.Sport;
//import org.example.entity.enums.EventStatus;
//import org.example.repository.EventRepository;
//import org.example.repository.MarketRepository;
//import org.example.repository.OddRepository;
//import org.example.repository.SportRepository;
//import org.springframework.boot.CommandLineRunner;
//import org.springframework.stereotype.Component;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.time.LocalDateTime;
//import java.util.Random;
//
////uzywane do populacji abzy na test jezlei abza jest pusta
////spring sam wykrueji uruchami
//@Component
//@RequiredArgsConstructor
//public class BettingDataSeeder implements CommandLineRunner {
//
//    private final SportRepository sportRepository;
//    private final EventRepository eventRepository;
//    private final MarketRepository marketRepository;
//    private final OddRepository oddRepository;
//
//    @Override
//    @Transactional
//    public void run(String... args){
//        /*
//        if (eventRepository.findByEventStatus(EventStatus.UPCOMING).size() < 3) {
//            return;
//        }
//         */
//
//        System.out.println("populacja bazy");
//
//        //sport
//        Sport football = new Sport();
//        football.setSportName("Football");
//        sportRepository.save(football);
//        String[] teams = new String[]{("Real Madrid")
//                ,("Barcelona") , ("Atletico Madrid") , ("Betis") , ("Villlareal")
//                ,("Celta Vigo")};
//
//        //mecz + wyniki + kursy
//        for(int i = 0 ; i <= 6 ; i++){
//            Random r= new Random();
//            String team1 = teams[r.nextInt(teams.length)];
//            String team2 = teams[r.nextInt(teams.length)];
//            while(team1.equals(team2)) {
//                team2 = teams[r.nextInt(teams.length)];
//            }
//
//            //mecz
//            Event match = new Event();
//            match.setSports(football);
//            match.setEventName(team1 + " vs " + team2);
//            match.setStartTime(LocalDateTime.now().plusHours(r.nextInt(23)+1));
//            match.setEventStatus(EventStatus.UPCOMING);
//            eventRepository.save(match);
//
//            //wyniki meczu
//            Market market = new Market();
//            market.setEvent(match);
//            market.setMarketName("Match Winner");
//            market.setSettled(false);
//            marketRepository.save(market);
//
//            //kursy
//            createOdd(market, team1, Math.random() * (2)+1);
//            createOdd(market, "Draw",Math.random() * (2)+1);
//            createOdd(market, team2, Math.random() * (2)+1);
//        }
//
//        System.out.println("baza wypelniona danymi");
//    }
//
//    private void createOdd(Market market, String name, double value) {
//        Odd odd = new Odd();
//        odd.setMarket(market);
//        odd.setOutcomeName(name);
//        odd.setOddValue(value);
//        odd.setActive(true);
//        oddRepository.save(odd);
//    }
//}