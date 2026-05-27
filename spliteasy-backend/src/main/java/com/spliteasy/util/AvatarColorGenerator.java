package com.spliteasy.util;

import java.util.List;
import java.util.Random;

public class AvatarColorGenerator {

    private static final List<String> COLORS = List.of(
            "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
            "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F",
            "#BB8FCE", "#85C1E9", "#F8C471", "#82E0AA"
    );

    private static final Random RANDOM = new Random();

    private AvatarColorGenerator() {
    }

    public static String generate() {
        return COLORS.get(RANDOM.nextInt(COLORS.size()));
    }
}
