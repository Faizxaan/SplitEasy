package com.spliteasy.config;

import com.spliteasy.entity.Group;
import com.spliteasy.entity.GroupMember;
import com.spliteasy.entity.User;
import com.spliteasy.enums.Currency;
import com.spliteasy.enums.GroupCategory;
import com.spliteasy.repository.GroupMemberRepository;
import com.spliteasy.repository.GroupRepository;
import com.spliteasy.repository.UserRepository;
import com.spliteasy.util.AvatarColorGenerator;
import com.spliteasy.util.InviteCodeGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Dev data already seeded, skipping...");
            return;
        }

        log.info("Seeding development data...");

        User faizan = User.builder()
                .fullName("Faizan Ahmed")
                .email("faizan@spliteasy.com")
                .password(passwordEncoder.encode("password123"))
                .avatarColor(AvatarColorGenerator.generate())
                .build();

        User alice = User.builder()
                .fullName("Alice Sharma")
                .email("alice@spliteasy.com")
                .password(passwordEncoder.encode("password123"))
                .avatarColor(AvatarColorGenerator.generate())
                .build();

        User bob = User.builder()
                .fullName("Bob Verma")
                .email("bob@spliteasy.com")
                .password(passwordEncoder.encode("password123"))
                .avatarColor(AvatarColorGenerator.generate())
                .build();

        userRepository.save(faizan);
        userRepository.save(alice);
        userRepository.save(bob);

        String inviteCode;
        do {
            inviteCode = InviteCodeGenerator.generate();
        } while (groupRepository.existsByInviteCode(inviteCode));

        Group goaTrip = Group.builder()
                .name("Goa Trip 2026")
                .description("Beach vacation with friends")
                .category(GroupCategory.TRIP)
                .currency(Currency.INR)
                .inviteCode(inviteCode)
                .createdBy(faizan)
                .build();

        groupRepository.save(goaTrip);

        GroupMember member1 = GroupMember.builder().group(goaTrip).user(faizan).build();
        GroupMember member2 = GroupMember.builder().group(goaTrip).user(alice).build();
        GroupMember member3 = GroupMember.builder().group(goaTrip).user(bob).build();

        groupMemberRepository.save(member1);
        groupMemberRepository.save(member2);
        groupMemberRepository.save(member3);

        log.info("Dev data seeded successfully!");
        log.info("Sample group invite code: {}", goaTrip.getInviteCode());
        log.info("Login with: faizan@spliteasy.com / password123");
    }
}
