package cl.duoc.foro.moderacion;

import java.util.TimeZone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MsModeracionApplication {

    public static void main(String[] args) {
        // Las fechas se guardan y se muestran en hora de Chile
        TimeZone.setDefault(TimeZone.getTimeZone("America/Santiago"));
        SpringApplication.run(MsModeracionApplication.class, args);
    }
}
