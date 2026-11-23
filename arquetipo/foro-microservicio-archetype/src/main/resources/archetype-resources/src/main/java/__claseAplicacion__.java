package ${package};

import java.util.TimeZone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ${claseAplicacion} {

    public static void main(String[] args) {
        // Las fechas se guardan y se muestran en hora de Chile
        TimeZone.setDefault(TimeZone.getTimeZone("America/Santiago"));
        SpringApplication.run(${claseAplicacion}.class, args);
    }
}
