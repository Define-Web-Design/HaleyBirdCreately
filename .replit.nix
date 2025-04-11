{ pkgs }: {
  deps = [
    pkgs.nodejs-20_x
    pkgs.nodePackages.typescript-language-server
    pkgs.yarn
    pkgs.replitPackages.jest
    pkgs.curl
    pkgs.bash
  ];
  
  # Bootup script that runs when the environment starts
  onBoot = ''
    # Make scripts executable
    chmod +x startup.sh
    chmod +x keep-url-alive.sh
    chmod +x control-keep-alive.sh
    
    # Start the keep-alive system if it's not already running
    if [ ! -f .never-sleep.pid ] || ! ps -p $(cat .never-sleep.pid 2>/dev/null) > /dev/null; then
      if [ ! -f .bash-keep-alive.pid ] || ! ps -p $(cat .bash-keep-alive.pid 2>/dev/null) > /dev/null; then
        mkdir -p logs
        nohup ./startup.sh > logs/bootup.log 2>&1 &
      fi
    fi
  '';
}